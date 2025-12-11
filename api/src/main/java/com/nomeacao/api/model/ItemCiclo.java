package com.nomeacao.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "itens_ciclo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemCiclo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ciclo_id")
    private Ciclo ciclo;

    @ManyToOne
    @JoinColumn(name = "materia_id")
    private Materia materia;

    private Integer ordem;

    private Double horasMeta;
    
    private Integer questoesMeta = 0;
}