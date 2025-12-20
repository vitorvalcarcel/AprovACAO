package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotNull;

public record DadosStatusTutorial(
        @NotNull
        Boolean concluido
) {}