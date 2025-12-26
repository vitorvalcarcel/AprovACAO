package com.nomeacao.api.dto;

import java.util.List;

public record DashboardDTO(
        Long segundosLiquidos,
        Integer questoesFeitas,
        Double taxaAcertos,

        Long cicloId,
        String nomeConcurso,
        Double progressoGeral,
        List<DadosGrafico> evolucaoDiaria,
        List<ItemProgresso> itens) {
    public record ItemProgresso(
            String nomeMateria,
            Long metaSegundos,
            Long segundosRealizados,
            Long saldoSegundos,
            Double percentualHoras,

            Integer metaQuestoes,
            Long questoesRealizadas,
            Long saldoQuestoes,
            Double percentualQuestoes) {
    }
}