package com.nomeacao.api.dto;

import java.util.List;

public record DadosSugestaoCiclo(
    Long concursoId,
    Double horasTotais,
    List<ItemSugestao> itens
) {
    public record ItemSugestao(
        Long materiaId,
        String nomeMateria,
        Double peso,
        Integer questoes,
        Double horasSugeridas
    ) {}
}