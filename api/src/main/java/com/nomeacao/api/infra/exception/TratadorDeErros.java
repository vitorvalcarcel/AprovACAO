package com.nomeacao.api.infra.exception;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class TratadorDeErros {

    // 404 - Não Encontrado (JPA)
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity tratarErro404() {
        return ResponseEntity.notFound().build();
    }

    // 400 - Erro de Validação (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity tratarErro400(MethodArgumentNotValidException ex) {
        var erros = ex.getFieldErrors();
        return ResponseEntity.badRequest().body(erros.stream().map(DadosErroValidacao::new).toList());
    }

    // 400 - Erro de JSON inválido ou Regra de Negócio genérica
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity tratarErroJson(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(new DadosErro("Formato de requisição inválido."));
    }

    // 400 - Erros de Regra de Negócio (Lançados manualmente com RuntimeException)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity tratarErroRegraDeNegocio(RuntimeException ex) {
        return ResponseEntity.badRequest().body(new DadosErro(ex.getMessage()));
    }

    // 401 - Falha na Autenticação
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity tratarErroBadCredentials() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new DadosErro("Credenciais inválidas."));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity tratarErroAuthentication() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new DadosErro("Falha na autenticação."));
    }

    // 403 - Acesso Negado
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity tratarErroAcessoNegado() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new DadosErro("Acesso negado."));
    }

    // 500 - Erro Interno (Genérico)
    @ExceptionHandler(Exception.class)
    public ResponseEntity tratarErro500(Exception ex) {
        ex.printStackTrace(); // Log no console do servidor
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new DadosErro("Erro interno do servidor: " + ex.getLocalizedMessage()));
    }

    // --- DTOs de Resposta ---

    // DTO para erros de validação de campos (Lista)
    public record DadosErroValidacao(String campo, String mensagem) {
        public DadosErroValidacao(FieldError erro) {
            this(erro.getField(), erro.getDefaultMessage());
        }
    }

    // DTO para mensagens de erro simples
    public record DadosErro(String mensagem) {}
}