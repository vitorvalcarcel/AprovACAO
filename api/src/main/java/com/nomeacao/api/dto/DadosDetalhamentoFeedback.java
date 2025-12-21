package com.nomeacao.api.dto;

import com.nomeacao.api.model.Feedback;
import java.time.LocalDateTime;

public record DadosDetalhamentoFeedback(
        Long id,
        String tipo,
        String mensagem,
        LocalDateTime dataEnvio
) {
    public DadosDetalhamentoFeedback(Feedback feedback) {
        this(feedback.getId(), feedback.getTipo().toString(), feedback.getMensagem(), feedback.getDataEnvio());
    }
}