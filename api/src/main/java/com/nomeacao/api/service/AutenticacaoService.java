package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosAtualizacaoUsuario;
import com.nomeacao.api.dto.DadosCadastroUsuario;
import com.nomeacao.api.dto.DadosDetalhamentoUsuario;
import com.nomeacao.api.dto.DadosTrocaSenha;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AutenticacaoService implements UserDetailsService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private TipoEstudoService tipoEstudoService;

    // Injeção dos repositórios para fazer a limpeza
    @Autowired private RegistroEstudoRepository registroRepository;
    @Autowired private ConcursoRepository concursoRepository;
    @Autowired private MateriaRepository materiaRepository;
    @Autowired private TipoEstudoRepository tipoEstudoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado!"));
    }

    @Transactional
    public void cadastrar(DadosCadastroUsuario dados) {
        // 1. Verificar duplicidade
        if (repository.findByEmail(dados.email()).isPresent()) {
            throw new RuntimeException("Este e-mail já está em uso.");
        }

        // 2. Criptografar e Salvar
        var senhaCriptografada = passwordEncoder.encode(dados.senha());
        var usuario = new Usuario();
        usuario.setNome(dados.nome());
        usuario.setEmail(dados.email());
        usuario.setSenha(senhaCriptografada);
        
        repository.save(usuario);
        
        // 3. Criar dados padrão
        tipoEstudoService.criarPadroes(usuario);
    }

    public DadosDetalhamentoUsuario detalhar(Usuario usuario) {
        return new DadosDetalhamentoUsuario(usuario);
    }

    @Transactional
    public DadosDetalhamentoUsuario atualizar(DadosAtualizacaoUsuario dados, Usuario usuarioLogado) {
        var usuario = repository.findById(usuarioLogado.getId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        usuario.setNome(dados.nome());
        // O JPA salva automaticamente ao fim da transação, mas podemos forçar o retorno atualizado
        return new DadosDetalhamentoUsuario(usuario);
    }

    @Transactional
    public void trocarSenha(DadosTrocaSenha dados, Usuario usuarioLogado) {
        var usuario = repository.findById(usuarioLogado.getId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // 1. Validar senha atual
        if (!passwordEncoder.matches(dados.senhaAtual(), usuario.getSenha())) {
            throw new RuntimeException("A senha atual está incorreta.");
        }

        // 2. Validar se a nova senha é igual à antiga (opcional, mas boa prática)
        if (passwordEncoder.matches(dados.novaSenha(), usuario.getSenha())) {
            throw new RuntimeException("A nova senha não pode ser igual à anterior.");
        }

        // 3. Criptografar e atualizar
        String novaSenhaHash = passwordEncoder.encode(dados.novaSenha());
        usuario.setSenha(novaSenhaHash);
    }

    @Transactional
    public void excluirConta(Usuario usuarioLogado) {
        // EQUIPE DE LIMPEZA
        // A ordem importa para não violar chaves estrangeiras no banco

        // 1. Apagar Registros de Estudo (Dependem de tudo: Matéria, Concurso, Tipo, Usuário)
        registroRepository.deleteAllByUsuario(usuarioLogado);

        // 2. Apagar Concursos (O banco já deleta Ciclos em cascata devido ao ON DELETE CASCADE configurado no Flyway)
        var concursos = concursoRepository.findAllByUsuario(usuarioLogado);
        concursoRepository.deleteAll(concursos);

        // 3. Apagar Matérias (O banco já deleta Tópicos em cascata)
        var materias = materiaRepository.findAllByUsuario(usuarioLogado);
        materiaRepository.deleteAll(materias);

        // 4. Apagar Tipos de Estudo
        var tipos = tipoEstudoRepository.findAllByUsuario(usuarioLogado);
        tipoEstudoRepository.deleteAll(tipos);

        // 5. Finalmente, apagar o usuário
        repository.delete(usuarioLogado);
    }
}