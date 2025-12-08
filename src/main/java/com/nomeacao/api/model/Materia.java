package com.nomeacao.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "materias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Materia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @ManyToOne(fetch = FetchType.LAZY) // Muitas matérias pertencem a Um usuário
    @JoinColumn(name = "usuario_id") // Nome da coluna no banco que liga as tabelas
    private Usuario usuario;

    public void atualizarInformacoes(String novoNome) {
        if (novoNome != null && !novoNome.trim().isEmpty()) {
            this.nome = novoNome;
        }
    }
}