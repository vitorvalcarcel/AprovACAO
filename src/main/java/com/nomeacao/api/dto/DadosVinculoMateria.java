package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DadosVinculoMateria(
    @NotNull
    Long materiaId,
    
    @NotNull
    @Positive
    Double peso,
    
    @NotNull
    @Positive
    Integer questoesProva
) {
}