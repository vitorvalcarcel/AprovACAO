package com.nomeacao.api.dto;

import java.sql.Date;

public record EvolucaoDiariaDTO(
    Date data,
    Long totalSegundos
) {}