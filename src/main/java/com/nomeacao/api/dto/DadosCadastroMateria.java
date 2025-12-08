package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotBlank;

public record DadosCadastroMateria(
    @NotBlank
    String nome
) {
}