package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DadosAtualizacaoVinculo(
    @NotNull
    Long id,
    
    @Positive
    Double peso,
    
    @Positive
    Integer questoesProva
) {
}