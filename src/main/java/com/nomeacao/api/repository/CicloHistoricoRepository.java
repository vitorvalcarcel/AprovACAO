package com.nomeacao.api.repository;

import com.nomeacao.api.model.CicloHistorico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CicloHistoricoRepository extends JpaRepository<CicloHistorico, Long> {
    @Query("""
        SELECT new com.nomeacao.api.dto.ResumoHistoricoDTO(
            ch.materia.id, 
            SUM(ch.horasDescontadas), 
            SUM(ch.questoesDescontadas)
        )
        FROM CicloHistorico ch
        WHERE ch.ciclo.concurso.id = :concursoId
        GROUP BY ch.materia.id
    """)
    List<com.nomeacao.api.dto.ResumoHistoricoDTO> somarDescontosPorConcurso(Long concursoId);
}