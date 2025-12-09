package com.nomeacao.api.repository;

import com.nomeacao.api.model.Ciclo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface CicloRepository extends JpaRepository<Ciclo, Long> {
    Optional<Ciclo> findByConcursoIdAndAtivoTrue(Long concursoId);

    @Query("""
        SELECT COUNT(c) > 0 
        FROM Ciclo c 
        JOIN c.itens i 
        WHERE c.ativo = true 
        AND i.materia.id = :materiaId
    """)
    boolean isMateriaEmCicloAtivo(Long materiaId);
}