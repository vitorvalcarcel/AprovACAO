package com.nomeacao.api.repository;

import com.nomeacao.api.model.RefreshToken;
import com.nomeacao.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    void deleteAllByUsuario(Usuario usuario);
}
