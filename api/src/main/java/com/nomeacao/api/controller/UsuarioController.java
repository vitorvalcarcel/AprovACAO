package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosAtualizacaoUsuario;
import com.nomeacao.api.dto.DadosCadastroUsuario;
import com.nomeacao.api.dto.DadosDetalhamentoUsuario;
import com.nomeacao.api.dto.DadosTrocaSenha;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.service.AutenticacaoService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private AutenticacaoService service;

    // 1. Cadastro (Público)
    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroUsuario dados, UriComponentsBuilder uriBuilder) {
        try {
            service.cadastrar(dados);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MensagemErro(e.getMessage()));
        }
    }

    // 2. Perfil (Logado)
    @GetMapping("/me")
    public ResponseEntity<DadosDetalhamentoUsuario> detalhar(@AuthenticationPrincipal Usuario usuario) {
        var dados = service.detalhar(usuario);
        return ResponseEntity.ok(dados);
    }

    // 3. Atualizar Nome (Logado)
    @PutMapping
    @Transactional
    public ResponseEntity<DadosDetalhamentoUsuario> atualizar(@RequestBody @Valid DadosAtualizacaoUsuario dados, 
                                                              @AuthenticationPrincipal Usuario usuario) {
        var atualizado = service.atualizar(dados, usuario);
        return ResponseEntity.ok(atualizado);
    }

    // 4. Trocar Senha (Logado)
    @PatchMapping("/senha")
    @Transactional
    public ResponseEntity trocarSenha(@RequestBody @Valid DadosTrocaSenha dados, 
                                      @AuthenticationPrincipal Usuario usuario) {
        try {
            service.trocarSenha(dados, usuario);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MensagemErro(e.getMessage()));
        }
    }

    // 5. Excluir Conta (Logado)
    @DeleteMapping
    @Transactional
    public ResponseEntity excluirConta(@AuthenticationPrincipal Usuario usuario) {
        service.excluirConta(usuario);
        return ResponseEntity.noContent().build();
    }

    // DTO interno simples para devolver JSON de erro
    private record MensagemErro(String mensagem) {}
}