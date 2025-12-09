package com.nomeacao.api.repository;

import com.nomeacao.api.model.ConcursoMateria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConcursoMateriaRepository extends JpaRepository<ConcursoMateria, Long> {
    boolean existsByConcursoIdAndMateriaId(Long concursoId, Long materiaId);
    boolean existsByMateriaId(Long materiaId);
    List<ConcursoMateria> findAllByConcursoId(Long concursoId);
}