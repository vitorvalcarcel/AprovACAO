package com.nomeacao.api.repository;

import com.nomeacao.api.model.ConcursoMateria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConcursoMateriaRepository extends JpaRepository<ConcursoMateria, Long> {
    boolean existsByConcursoIdAndMateriaId(Long concursoId, Long materiaId);
}