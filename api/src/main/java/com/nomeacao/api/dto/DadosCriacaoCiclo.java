package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record DadosCriacaoCiclo(
        @NotNull Long concursoId,
        String descricao,
        Long totalSegundos,
        Integer totalQuestoes,
        List<DadosItemCiclo> itens) {
    public record DadosItemCiclo(
            Long materiaId,
            Long segundosMeta,
            Integer questoesMeta,
            Integer ordem) {
    }
}