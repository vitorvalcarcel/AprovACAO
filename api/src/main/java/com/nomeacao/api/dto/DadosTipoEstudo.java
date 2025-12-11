package com.nomeacao.api.dto;

import com.nomeacao.api.model.TipoEstudo;
import jakarta.validation.constraints.NotBlank;

public record DadosTipoEstudo(
    Long id,
    
    @NotBlank
    String nome,
    
    Boolean arquivado
) {
    public DadosTipoEstudo(TipoEstudo tipo) {
        this(tipo.getId(), tipo.getNome(), tipo.getArquivado());
    }
}