package com.nomeacao.api.dto;

import com.nomeacao.api.model.ConcursoMateria;

public record DadosDetalhamentoVinculo(
    Long id, 
    Long concursoId, 
    String nomeMateria, 
    Double peso, 
    Integer questoesProva
) {
    public DadosDetalhamentoVinculo(ConcursoMateria vinculo) {
        this(vinculo.getId(), 
             vinculo.getConcurso().getId(), 
             vinculo.getMateria().getNome(), 
             vinculo.getPeso(), 
             vinculo.getQuestoesProva());
    }
}