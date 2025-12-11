package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record DadosCriacaoCiclo(
    @NotNull Long concursoId,
    String descricao,
    Double totalHoras,
    Integer totalQuestoes,
    List<DadosItemCiclo> itens
) {
    public record DadosItemCiclo(
        Long materiaId,
        Double horasMeta,
        Integer questoesMeta,
        Integer ordem
    ) {}
}