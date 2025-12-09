package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record DadosCriacaoCiclo(
    @NotNull Long concursoId,
    String anotacoes,
    @NotNull List<ItemMeta> itens
) {
    public record ItemMeta(
        @NotNull Long materiaId,
        @NotNull Double horasMeta
    ) {}
}