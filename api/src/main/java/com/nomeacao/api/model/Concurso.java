package com.nomeacao.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;

@Entity
@Table(name = "concursos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Concurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private Boolean arquivado = false;

    @Column(length = 50)
    private String banca;

    @Column(name = "data_prova")
    private LocalDate dataProva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @OneToMany(mappedBy = "concurso", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private java.util.List<ConcursoMateria> materias;

    @OneToMany(mappedBy = "concurso", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private java.util.List<Ciclo> ciclos;

    public void atualizarInformacoes(String nome, String banca, LocalDate dataProva) {
        if (nome != null && !nome.trim().isEmpty()) {
            this.nome = nome;
        }
        if (banca != null) {
            this.banca = banca;
        }
        if (dataProva != null) {
            this.dataProva = dataProva;
        }
    }
}