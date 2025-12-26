package com.nomeacao.api.dto;

public record DadosGrafico(
        String label, // Ex: "10/12"
        Long valor // Ex: 3600 segundos
) {
}