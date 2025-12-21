package com.nomeacao.api.infra.security;

public record DadosTokenJWT(String accessToken, String refreshToken) {
}