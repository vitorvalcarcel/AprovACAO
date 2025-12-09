package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DadosCadastroTopico(
    @NotBlank
    String nome,
    
    @NotNull // O ID da matéria é obrigatório
    Long materiaId
) {
}