package com.nomeacao.api.dto;

import java.util.List;

public record MateriaComTopicosDTO(
    Long id,
    String nome,
    List<DadosListagemTopico> topicos
) {}