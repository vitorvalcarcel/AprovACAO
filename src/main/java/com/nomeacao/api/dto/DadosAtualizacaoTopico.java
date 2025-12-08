package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotNull;

public record DadosAtualizacaoTopico(
    @NotNull
    Long id,
    String nome
) {
}