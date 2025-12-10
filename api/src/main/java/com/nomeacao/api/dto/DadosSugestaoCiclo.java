package com.nomeacao.api.dto;

public record DadosSugestaoCiclo(
    Long materiaId,
    String nomeMateria,
    Double peso,
    Integer questoes,
    Double horasSugeridas,
    Double percentual
) {}