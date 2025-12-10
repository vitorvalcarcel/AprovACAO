package com.nomeacao.api.repository;

import com.nomeacao.api.model.CicloHistorico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CicloHistoricoRepository extends JpaRepository<CicloHistorico, Long> {

    @Query("""
        SELECT new com.nomeacao.api.dto.ResumoHistoricoDTO(
            ch.materia.id,
            CAST(SUM(ch.horasDescontadas * 3600) AS long), 
            SUM(CAST(ch.questoesDescontadas AS long))
        )
        FROM CicloHistorico ch
        WHERE ch.ciclo.concurso.id = :concursoId
        GROUP BY ch.materia.id
    """)
    List<com.nomeacao.api.dto.ResumoHistoricoDTO> somarDescontosPorConcurso(@Param("concursoId") Long concursoId);
}