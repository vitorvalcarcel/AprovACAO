package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record DadosCadastroRegistro(
    @NotNull Long materiaId,
    @NotNull LocalDateTime dataInicio,
    @NotNull @Positive Integer minutos,
    
    Long topicoId,
    Long concursoId,
    Long tipoEstudoId,
    Integer questoesFeitas,
    Integer questoesCertas,
    String anotacoes
) {}