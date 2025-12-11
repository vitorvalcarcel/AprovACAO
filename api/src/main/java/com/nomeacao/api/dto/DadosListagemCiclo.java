package com.nomeacao.api.dto;

import com.nomeacao.api.model.Ciclo;
import java.time.LocalDateTime;

public record DadosListagemCiclo(
    Long id,
    String descricao,
    String nomeConcurso,
    Boolean ativo,
    LocalDateTime dataInicio,
    LocalDateTime dataFim,
    Double progresso
) {
    public DadosListagemCiclo(Ciclo ciclo, Double progressoCalculado) {
        this(
            ciclo.getId(),
            ciclo.getDescricao(),
            ciclo.getConcurso().getNome(),
            ciclo.getAtivo(),
            ciclo.getDataInicio(),
            ciclo.getDataFim(),
            progressoCalculado
        );
    }
}