package com.nomeacao.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "concurso_materias", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"concurso_id", "materia_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConcursoMateria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concurso_id", nullable = false)
    private Concurso concurso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;

    @Column(nullable = false)
    private Double peso;

    @Column(name = "questoes_prova", nullable = false)
    private Integer questoesProva;
}