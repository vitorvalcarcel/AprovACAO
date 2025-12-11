package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record DadosCadastroRegistro(
    @NotNull Long materiaId,
    Long topicoId,
    Long concursoId,
    Long tipoEstudoId,
    
    @NotNull LocalDateTime dataInicio,
    @NotNull Integer segundos,
    
    Integer questoesFeitas,
    Integer questoesCertas,
    
    Boolean contarHorasNoCiclo,
    
    String anotacoes
) {}