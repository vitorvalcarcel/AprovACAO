package com.nomeacao.api.dto;

import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record DadosAtualizacaoRegistro(
    Long id,
    LocalDateTime dataInicio,
    @Positive Integer segundos,
    Integer questoesFeitas,
    Integer questoesCertas,
    String anotacoes,
    Long materiaId,
    Long topicoId,
    Long tipoEstudoId,
    Boolean contarHorasNoCiclo
) {
}