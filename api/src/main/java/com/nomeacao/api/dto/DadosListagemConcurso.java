package com.nomeacao.api.dto;

import com.nomeacao.api.model.Concurso;
import java.time.LocalDate;

public record DadosListagemConcurso(Long id, String nome, String banca, LocalDate dataProva) {
    public DadosListagemConcurso(Concurso concurso) {
        this(concurso.getId(), concurso.getNome(), concurso.getBanca(), concurso.getDataProva());
    }
}