package com.nomeacao.api.repository;

import com.nomeacao.api.model.Ciclo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CicloRepository extends JpaRepository<Ciclo, Long> {
    Optional<Ciclo> findByConcursoIdAndAtivoTrue(Long concursoId);
}