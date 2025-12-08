package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record DadosAtualizacaoConcurso(
    @NotNull
    Long id,
    String nome,
    String banca,
    LocalDate dataProva
) {
}