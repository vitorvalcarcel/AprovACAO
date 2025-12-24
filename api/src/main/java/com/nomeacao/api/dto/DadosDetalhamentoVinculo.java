package com.nomeacao.api.dto;

import com.nomeacao.api.model.ConcursoMateria;

public record DadosDetalhamentoVinculo(
        Long id,
        Long concursoId,
        String nomeMateria,
        Double peso,
        Integer questoesProva,
        String tipo) {
    public DadosDetalhamentoVinculo(ConcursoMateria vinculo) {
        this(vinculo.getId(),
                vinculo.getConcurso().getId(),
                vinculo.getMateria().getNome(),
                vinculo.getPeso(),
                vinculo.getQuestoesProva(),
                vinculo.getMateria().getTipo().toString());
    }
}