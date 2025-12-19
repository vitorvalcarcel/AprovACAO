package com.nomeacao.api.dto;

import com.nomeacao.api.model.Topico;

public record DadosListagemTopico(
    Long id, 
    String nome,
    Boolean arquivado
) {
    public DadosListagemTopico(Topico topico) {
        this(topico.getId(), topico.getNome(), topico.getArquivado());
    }
}