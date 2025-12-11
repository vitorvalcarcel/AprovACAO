package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotBlank;

public record DadosAtualizacaoUsuario(
    @NotBlank
    String nome
) {}