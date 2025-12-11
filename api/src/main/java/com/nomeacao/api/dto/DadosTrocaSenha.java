package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DadosTrocaSenha(
    @NotBlank
    String senhaAtual,

    @NotBlank
    @Size(min = 8, message = "A nova senha deve ter no mínimo 8 caracteres")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$", 
        message = "A nova senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais"
    )
    String novaSenha
) {}