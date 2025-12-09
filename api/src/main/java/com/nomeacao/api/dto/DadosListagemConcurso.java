package com.nomeacao.api.dto;

import com.nomeacao.api.model.Concurso;
import java.time.LocalDate;

public record DadosListagemConcurso(
    Long id, 
    String nome, 
    String banca, 
    LocalDate dataProva,
    Boolean arquivado
) {
    public DadosListagemConcurso(Concurso concurso) {
        this(
            concurso.getId(), 
            concurso.getNome(), 
            concurso.getBanca(), 
            concurso.getDataProva(),
            concurso.getArquivado()
        );
    }
}