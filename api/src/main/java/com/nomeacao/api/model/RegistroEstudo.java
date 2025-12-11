package com.nomeacao.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros_estudo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroEstudo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime dataInicio;

    private Boolean contarHorasNoCiclo = true;

    @Column(nullable = false)
    private Integer segundos;

    @Column(name = "questoes_feitas")
    private Integer questoesFeitas;

    @Column(name = "questoes_certas")
    private Integer questoesCertas;

    @Column(columnDefinition = "TEXT")
    private String anotacoes;

    // Vínculos
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topico_id")
    private Topico topico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concurso_id")
    private Concurso concurso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_estudo_id")
    private TipoEstudo tipoEstudo;
}