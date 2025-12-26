package com.nomeacao.api.repository;

import com.nomeacao.api.model.Ciclo;
import com.nomeacao.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface CicloRepository extends JpaRepository<Ciclo, Long> {

    @Query("SELECT c FROM Ciclo c WHERE c.concurso.usuario = :usuario AND c.ativo = true")
    Optional<Ciclo> findFirstByUsuarioAndAtivoTrue(@Param("usuario") Usuario usuario);

    Optional<Ciclo> findByConcursoIdAndAtivoTrue(Long concursoId);

    List<Ciclo> findAllByConcursoIdOrderByDataInicioDesc(Long concursoId);

    @Query("""
            SELECT COUNT(i) > 0
            FROM ItemCiclo i
            WHERE i.materia.id = :materiaId
            AND i.ciclo.ativo = true
            """)
    boolean isMateriaEmCicloAtivo(Long materiaId);

    @Query("SELECT DISTINCT c FROM Ciclo c LEFT JOIN FETCH c.itens i LEFT JOIN FETCH i.materia WHERE c.concurso.id = :concursoId ORDER BY c.dataInicio DESC")
    List<Ciclo> findAllComItensPorConcursoId(@Param("concursoId") Long concursoId);
}