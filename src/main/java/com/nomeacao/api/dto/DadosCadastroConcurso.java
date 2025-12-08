package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record DadosCadastroConcurso(
    @NotBlank
    String nome,
    String banca,
    LocalDate dataProva
) {
}