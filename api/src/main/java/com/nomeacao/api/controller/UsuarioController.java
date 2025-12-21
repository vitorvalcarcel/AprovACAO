package com.nomeacao.api.controller;

import com.nomeacao.api.dto.*;
import com.nomeacao.api.infra.security.DadosTokenJWT;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.service.AutenticacaoService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private AutenticacaoService service;

    // 1. Cadastro
    @PostMapping
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroUsuario dados) {
        try {
            service.cadastrar(dados);
            return ResponseEntity.ok().body(new MensagemErro("Cadastro realizado! Verifique seu e-mail para ativar a conta."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MensagemErro(e.getMessage()));
        }
    }

    // 2. Confirmar E-mail
    @PostMapping("/confirmar-email")
    public ResponseEntity<DadosTokenJWT> confirmarEmail(@RequestParam String token) {
        try {
            DadosTokenJWT jwt = service.confirmarEmail(token);
            return ResponseEntity.ok(jwt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 3. Reenviar Confirmação
    @PostMapping("/reenviar-confirmacao")
    public ResponseEntity reenviarConfirmacao(@RequestBody DadosReenvioEmail dados) {
        try {
            service.reenviarConfirmacao(dados.email());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MensagemErro(e.getMessage()));
        }
    }

    // 4. Solicitar Recuperação
    @PostMapping("/esqueci-senha")
    public ResponseEntity esqueciSenha(@RequestBody DadosEsqueciSenha dados) {
        try {
            service.solicitarRecuperacaoSenha(dados.email());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.ok().build();
        }
    }

    // 5. Redefinir Senha
    @PostMapping("/redefinir-senha")
    public ResponseEntity redefinirSenha(@RequestBody @Valid DadosRedefinirSenha dados) {
        try {
            service.redefinirSenha(dados.token(), dados.novaSenha());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MensagemErro(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<DadosDetalhamentoUsuario> detalhar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.detalhar(usuario));
    }

    @PutMapping
    public ResponseEntity<DadosDetalhamentoUsuario> atualizar(@RequestBody @Valid DadosAtualizacaoUsuario dados, 
                                                              @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.atualizar(dados, usuario));
    }

    @PatchMapping("/senha")
    public ResponseEntity trocarSenha(@RequestBody @Valid DadosTrocaSenha dados, 
                                      @AuthenticationPrincipal Usuario usuario) {
        try {
            service.trocarSenha(dados, usuario);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MensagemErro(e.getMessage()));
        }
    }
    
    @PatchMapping("/tutorial")
    @Transactional
    public ResponseEntity atualizarStatusTutorial(@RequestBody @Valid DadosStatusTutorial dados, 
                                                  @AuthenticationPrincipal Usuario usuario) {
        service.atualizarStatusTutorial(usuario, dados.concluido());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity excluirConta(@RequestBody @Valid DadosConfirmacaoSenha dados,
                                       @AuthenticationPrincipal Usuario usuario) {
        try {
            service.excluirConta(dados.senha(), usuario);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MensagemErro(e.getMessage()));
        }
    }

    // --- DTOs Internos ---
    public record DadosReenvioEmail(String email) {}
    public record DadosEsqueciSenha(String email) {}
    
    public record DadosRedefinirSenha(
        @NotBlank String token, 
        
        @NotBlank
        @Size(min = 8, message = "A nova senha deve ter no mínimo 8 caracteres")
        @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$", 
            message = "A nova senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais"
        )
        String novaSenha
    ) {}
    
    private record MensagemErro(String mensagem) {}
}