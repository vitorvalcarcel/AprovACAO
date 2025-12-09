package com.nomeacao.api.infra.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class TratadorDeErros {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity tratarErro400(MethodArgumentNotValidException ex) {
        var erros = ex.getFieldErrors();
        
        // Pega apenas a primeira mensagem de erro para simplificar a exibição no front
        // ou concatena todas. Vamos pegar a primeira por enquanto.
        String mensagem = erros.stream()
                .map(FieldError::getDefaultMessage)
                .findFirst()
                .orElse("Erro de validação");

        return ResponseEntity.badRequest().body(new DadosErroValidacao(mensagem));
    }
    
    // DTO interno para devolver o JSON bonito
    public record DadosErroValidacao(String mensagem) {}
}