package com.nomeacao.api.dto;

import com.nomeacao.api.model.TipoFeedback;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DadosEnvioFeedback(
        @NotNull
        TipoFeedback tipo,

        @NotBlank
        @Size(min = 10, max = 1000, message = "A mensagem deve ter entre 10 e 1000 caracteres")
        String mensagem
) {}