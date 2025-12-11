package com.nomeacao.api.dto;

public record DadosSugestaoCiclo(
    Long materiaId,
    String nomeMateria,
    Double peso,
    Double horasSugeridas,
    Integer questoesSugeridas,
    Double percentual
) {}