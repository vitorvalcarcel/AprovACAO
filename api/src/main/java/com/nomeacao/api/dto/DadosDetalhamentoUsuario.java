package com.nomeacao.api.dto;

import com.nomeacao.api.model.Usuario;

public record DadosDetalhamentoUsuario(Long id, String nome, String email, Boolean tutorialConcluido) {
    public DadosDetalhamentoUsuario(Usuario usuario) {
        this(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getTutorialConcluido());
    }
}