package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosAtualizacaoUsuario;
import com.nomeacao.api.dto.DadosCadastroUsuario;
import com.nomeacao.api.dto.DadosDetalhamentoUsuario;
import com.nomeacao.api.dto.DadosTrocaSenha;
import com.nomeacao.api.infra.security.DadosTokenJWT;
import com.nomeacao.api.infra.security.TokenService;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AutenticacaoService implements UserDetailsService {

    @Autowired
    private UsuarioRepository repository;
    @Autowired
    private TipoEstudoService tipoEstudoService;
    @Autowired
    private RegistroEstudoRepository registroRepository;
    @Autowired
    private ConcursoRepository concursoRepository;
    @Autowired
    private MateriaRepository materiaRepository;
    @Autowired
    private TipoEstudoRepository tipoEstudoRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;
    @Autowired
    private TokenService jwtService;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado!"));
    }

    @Transactional
    public void cadastrar(DadosCadastroUsuario dados) {
        if (repository.findByEmail(dados.email()).isPresent()) {
            throw new RuntimeException("Este e-mail já está em uso.");
        }

        var usuario = new Usuario();
        usuario.setNome(dados.nome());
        usuario.setEmail(dados.email());
        usuario.setSenha(passwordEncoder.encode(dados.senha()));

        // Identidade
        usuario.setAtivo(false); // Bloqueia login
        usuario.setCodigoVerificacao(UUID.randomUUID().toString());
        usuario.setValidadeCodigo(LocalDateTime.now().plusHours(24));

        repository.save(usuario);

        // Cria dados padrão
        tipoEstudoService.criarPadroes(usuario);

        // Envia E-mail
        emailService.enviarConfirmacao(usuario.getEmail(), usuario.getNome(), usuario.getCodigoVerificacao());
    }

    @Transactional
    public DadosTokenJWT confirmarEmail(String token) {
        var usuario = repository.findByCodigoVerificacao(token)
                .orElseThrow(() -> new RuntimeException("Link inválido ou inexistente."));

        if (usuario.getValidadeCodigo().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Este link expirou. Solicite um novo.");
        }

        // Ativa a conta
        usuario.setAtivo(true);
        usuario.setCodigoVerificacao(null);
        usuario.setValidadeCodigo(null);
        repository.save(usuario);

        // Gera o JWT para Auto-Login
        // Gera o JWT para Auto-Login
        var accessToken = jwtService.gerarToken(usuario);
        var refreshToken = jwtService.gerarRefreshToken(usuario);
        return new DadosTokenJWT(accessToken, refreshToken);
    }

    @Transactional
    public void reenviarConfirmacao(String email) {
        var usuario = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com este e-mail."));

        if (usuario.getAtivo()) {
            throw new RuntimeException("Esta conta já está ativada. Tente fazer login.");
        }

        // Gera novo token e renova validade
        usuario.setCodigoVerificacao(UUID.randomUUID().toString());
        usuario.setValidadeCodigo(LocalDateTime.now().plusHours(24));
        repository.save(usuario);

        // Reenvia
        emailService.enviarConfirmacao(usuario.getEmail(), usuario.getNome(), usuario.getCodigoVerificacao());
    }

    @Transactional
    public void solicitarRecuperacaoSenha(String email) {
        var usuario = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        usuario.setCodigoVerificacao(UUID.randomUUID().toString());
        usuario.setValidadeCodigo(LocalDateTime.now().plusHours(1)); // 1 hora para senha
        repository.save(usuario);

        emailService.enviarRecuperacaoSenha(usuario.getEmail(), usuario.getCodigoVerificacao());
    }

    @Transactional
    public void redefinirSenha(String token, String novaSenha) {
        var usuario = repository.findByCodigoVerificacao(token)
                .orElseThrow(() -> new RuntimeException("Token inválido."));

        if (usuario.getValidadeCodigo().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Link expirado.");
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuario.setCodigoVerificacao(null);
        usuario.setValidadeCodigo(null);
        if (!usuario.getAtivo())
            usuario.setAtivo(true);

        repository.save(usuario);
    }

    public DadosDetalhamentoUsuario detalhar(Usuario usuario) {
        return new DadosDetalhamentoUsuario(usuario);
    }

    @Transactional
    public DadosDetalhamentoUsuario atualizar(DadosAtualizacaoUsuario dados, Usuario usuarioLogado) {
        var usuario = repository.findById(usuarioLogado.getId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        usuario.setNome(dados.nome());
        return new DadosDetalhamentoUsuario(usuario);
    }

    @Transactional
    public void trocarSenha(DadosTrocaSenha dados, Usuario usuarioLogado) {
        var usuario = repository.findById(usuarioLogado.getId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!passwordEncoder.matches(dados.senhaAtual(), usuario.getSenha())) {
            throw new RuntimeException("A senha atual está incorreta.");
        }
        if (passwordEncoder.matches(dados.novaSenha(), usuario.getSenha())) {
            throw new RuntimeException("A nova senha não pode ser igual à anterior.");
        }
        usuario.setSenha(passwordEncoder.encode(dados.novaSenha()));
    }

    @Transactional
    public void excluirConta(String senhaConfirmacao, Usuario usuarioLogado) {
        var usuario = repository.findById(usuarioLogado.getId()).orElseThrow();
        if (!passwordEncoder.matches(senhaConfirmacao, usuario.getSenha())) {
            throw new RuntimeException("Senha incorreta.");
        }
        registroRepository.deleteAllByUsuario(usuario);
        concursoRepository.deleteAll(concursoRepository.findAllByUsuario(usuario));
        materiaRepository.deleteAll(materiaRepository.findAllByUsuario(usuario));
        tipoEstudoRepository.deleteAll(tipoEstudoRepository.findAllByUsuario(usuario));
        refreshTokenRepository.deleteAllByUsuario(usuario);
        repository.delete(usuario);
    }

    public void atualizarStatusTutorial(Usuario usuario, Boolean concluido) {
        usuario.setTutorialConcluido(concluido);
        repository.save(usuario);
    }

}