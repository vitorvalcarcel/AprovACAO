package com.nomeacao.api.dto;

import java.util.List;

public record DashboardDTO(
    Double horasLiquidas,
    Integer questoesFeitas,
    Double taxaAcertos,

    Long cicloId,
    String nomeConcurso,
    Double progressoGeral,
    List<ItemProgresso> itens
) {
    public record ItemProgresso(
        String nomeMateria,
        Double metaHoras,
        Long segundosRealizados,
        Long saldoSegundos,
        Double percentual
    ) {}
}