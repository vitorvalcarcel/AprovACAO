package com.nomeacao.api.dto;

import java.util.List;

public record DadosCriacaoCiclo(
    Long concursoId,
    String descricao,
    Double totalHoras,
    List<DadosItemCiclo> itens
) {
    public record DadosItemCiclo(
        Long materiaId,
        Double horasMeta,
        Integer ordem
    ) {}
}