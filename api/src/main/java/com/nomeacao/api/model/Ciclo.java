package com.nomeacao.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ciclos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Ciclo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descricao;
    private Double totalHoras;
    private Boolean ativo;

    @ManyToOne
    @JoinColumn(name = "concurso_id")
    private Concurso concurso;

    @OneToMany(mappedBy = "ciclo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCiclo> itens = new ArrayList<>();

    public void adicionarItem(ItemCiclo item) {
        item.setCiclo(this);
        this.itens.add(item);
    }
}