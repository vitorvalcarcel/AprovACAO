package com.nomeacao.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Column(length = 50)
    private String banca;

    @Column(name = "data_prova")
    private LocalDate dataProva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

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