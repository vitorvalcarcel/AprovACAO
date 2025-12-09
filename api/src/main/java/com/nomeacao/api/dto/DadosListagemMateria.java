package com.nomeacao.api.dto;

import com.nomeacao.api.model.Materia;

public record DadosListagemMateria(Long id, String nome, Boolean arquivada) {
    
    public DadosListagemMateria(Materia materia) {
        this(materia.getId(), materia.getNome(), materia.getArquivada());
    }
}