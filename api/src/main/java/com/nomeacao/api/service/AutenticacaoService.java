package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosCadastroUsuario;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AutenticacaoService implements UserDetailsService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private TipoEstudoService tipoEstudoService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado!"));
    }

    public void cadastrar(DadosCadastroUsuario dados) {
        var senhaCriptografada = passwordEncoder.encode(dados.senha());
        var usuario = new Usuario();
        usuario.setNome(dados.nome());
        usuario.setEmail(dados.email());
        usuario.setSenha(senhaCriptografada);
        repository.save(usuario);
        tipoEstudoService.criarPadroes(usuario);
    }
}