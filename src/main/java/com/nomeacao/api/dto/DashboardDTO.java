package com.nomeacao.api.dto;

import java.util.List;

public record DashboardDTO(
    Long cicloId,
    String nomeConcurso,
    Double progressoGeral,
    List<ItemDashboard> itens
) {
    public record ItemDashboard(
        String nomeMateria,
        Double metaHoras,
        Double horasEstudadasTotal,
        Double horasSaldoAtual,
        Double percentualConcluido
    ) {}
}