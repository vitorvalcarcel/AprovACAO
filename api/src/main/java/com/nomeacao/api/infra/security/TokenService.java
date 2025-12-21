package com.nomeacao.api.infra.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.nomeacao.api.model.RefreshToken;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    public String gerarToken(Usuario usuario) {
        try {
            var algoritmo = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("API Nome.Acao")
                    .withSubject(usuario.getEmail())
                    .withExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES)) // 30 min em UTC
                    .sign(algoritmo);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token jwt", exception);
        }
    }

    public String gerarRefreshToken(Usuario usuario) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUsuario(usuario);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setDataExpiracao(Instant.now().plus(7, ChronoUnit.DAYS)); // 7 dias em UTC
        refreshToken.setRevoked(false);

        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }

    public String getSubject(String tokenJWT) {
        try {
            var algoritmo = Algorithm.HMAC256(secret);
            return JWT.require(algoritmo)
                    .withIssuer("API Nome.Acao")
                    .build()
                    .verify(tokenJWT)
                    .getSubject();
        } catch (JWTVerificationException exception) {
            throw new RuntimeException("Token JWT inválido ou expirado!");
        }
    }

    @Transactional
    public DadosTokenJWT rotacionarToken(String refreshTokenString) {
        // 1. Busca e Valida
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() -> new RuntimeException("Refresh Token não encontrado!"));

        // 2. Verifica Revogação e Expiração
        if (refreshToken.isExpirado() || refreshToken.isRevoked()) {
            throw new RuntimeException("Refresh Token inválido ou expirado!");
        }

        // 3. BLINDAGEM: Verifica se o usuário ainda está ativo
        if (!refreshToken.getUsuario().getAtivo()) {
            // Revoga preventivamente para impedir novas tentativas
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new RuntimeException("Conta inativa ou bloqueada.");
        }

        // 4. Revoga o anterior (Rotação)
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        // 5. Gera novos tokens
        Usuario usuario = refreshToken.getUsuario();
        String newAccessToken = gerarToken(usuario);
        String newRefreshToken = gerarRefreshToken(usuario);

        return new DadosTokenJWT(newAccessToken, newRefreshToken);
    }
}