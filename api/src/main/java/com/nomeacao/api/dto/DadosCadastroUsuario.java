package com.nomeacao.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DadosCadastroUsuario(
    @NotBlank
    String nome,
    
    @NotBlank
    @Email
    String email,
    
    @NotBlank
    @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$", 
        message = "A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais"
    )
    String senha
) {
}