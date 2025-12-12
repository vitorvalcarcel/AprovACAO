package com.nomeacao.api.infra.exception;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class TratadorDeErros {

    private static final Logger logger = LoggerFactory.getLogger(TratadorDeErros.class);

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

    // 400 - Erro de JSON inválido
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity tratarErroJson(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(new DadosErro("Formato de requisição inválido."));
    }

    // 400 - Regra de Negócio Genérica
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity tratarErroRegraDeNegocio(RuntimeException ex) {
        logger.warn("[REGRA NEGOCIO] {}", ex.getMessage());
        return ResponseEntity.badRequest().body(new DadosErro(ex.getMessage()));
    }

    // --- SEGURANÇA ---

    // 400 - Conta Inativa (Retornamos 400 para o front exibir o Toast de erro automaticamente)
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity tratarErroContaInativa() {
        return ResponseEntity.badRequest().body(new DadosErro("Conta inativa. Verifique seu e-mail para acessar."));
    }

    // 401 - Credenciais Inválidas
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity tratarErroBadCredentials() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new DadosErro("E-mail ou senha incorretos."));
    }

    // 401 - Outros erros de autenticação
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity tratarErroAuthentication() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new DadosErro("Falha na autenticação."));
    }

    // 403 - Acesso Negado
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity tratarErroAcessoNegado() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new DadosErro("Acesso negado."));
    }

    // 500 - Erro Interno
    @ExceptionHandler(Exception.class)
    public ResponseEntity tratarErro500(Exception ex) {
        logger.error("[ERRO 500] Exceção não tratada capturada: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new DadosErro("Erro interno do servidor: " + ex.getLocalizedMessage()));
    }

    // --- DTOs ---
    public record DadosErroValidacao(String campo, String mensagem) {
        public DadosErroValidacao(FieldError erro) {
            this(erro.getField(), erro.getDefaultMessage());
        }
    }

    public record DadosErro(String mensagem) {}
}