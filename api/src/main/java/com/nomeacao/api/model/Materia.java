package com.nomeacao.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

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

    @Column(nullable = false)
    private Boolean arquivada = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMateria tipo = TipoMateria.GERAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @OneToMany(mappedBy = "materia", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private java.util.List<Topico> topicos;

    @OneToMany(mappedBy = "materia", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private java.util.List<ConcursoMateria> concursos;

    @OneToMany(mappedBy = "materia", cascade = CascadeType.REMOVE)
    @ToString.Exclude
    private java.util.List<RegistroEstudo> registros;

    public void atualizarInformacoes(String novoNome) {
        if (novoNome != null && !novoNome.trim().isEmpty()) {
            this.nome = novoNome;
        }
    }

    public void setArquivada(Boolean status) {
        this.arquivada = status;
    }
}