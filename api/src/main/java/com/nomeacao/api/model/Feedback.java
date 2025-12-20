package com.nomeacao.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Table(name = "feedbacks")
@Entity(name = "Feedback")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    private TipoFeedback tipo;

    private String mensagem;

    private LocalDateTime dataEnvio;

    private Boolean resolvido;

    public Feedback(Usuario usuario, TipoFeedback tipo, String mensagem) {
        this.usuario = usuario;
        this.tipo = tipo;
        this.mensagem = mensagem;
        this.dataEnvio = LocalDateTime.now();
        this.resolvido = false;
    }
}