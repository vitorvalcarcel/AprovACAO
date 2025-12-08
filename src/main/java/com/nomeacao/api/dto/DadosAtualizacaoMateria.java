package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotNull;

public record DadosAtualizacaoMateria(
    @NotNull // O ID é obrigatório para saber QUAL matéria alterar
    Long id,
    String nome
) {
}