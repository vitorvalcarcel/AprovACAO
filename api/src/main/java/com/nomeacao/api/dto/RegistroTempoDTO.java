package com.nomeacao.api.dto;

import java.time.LocalDateTime;

public record RegistroTempoDTO(
        Long materiaId,
        LocalDateTime dataInicio,
        Integer segundos) {
}
