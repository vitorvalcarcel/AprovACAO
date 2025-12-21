package com.nomeacao.api.repository;

import com.nomeacao.api.model.Feedback;
import com.nomeacao.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    long countByUsuarioAndDataEnvioAfter(Usuario usuario, LocalDateTime dataLimite);
}