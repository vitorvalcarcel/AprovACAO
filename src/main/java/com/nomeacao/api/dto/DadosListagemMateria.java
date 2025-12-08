package com.nomeacao.api.dto;

import com.nomeacao.api.model.Materia;

public record DadosListagemMateria(Long id, String nome) {
    public DadosListagemMateria(Materia materia) {
        this(materia.getId(), materia.getNome());
    }
}