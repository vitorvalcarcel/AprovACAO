package com.nomeacao.api.dto;

import jakarta.validation.constraints.NotBlank;

public record DadosConfirmacaoSenha(
    @NotBlank
    String senha
) {
}