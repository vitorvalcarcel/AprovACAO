package com.nomeacao.api.repository;

import com.nomeacao.api.model.RegistroEstudo;
import com.nomeacao.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface RegistroEstudoRepository extends JpaRepository<RegistroEstudo, Long> {
    List<RegistroEstudo> findAllByUsuarioOrderByDataInicioDesc(Usuario usuario);
    // Futuro: findAllByConcursoId(Long concursoId);

    @Query("""
        SELECT new com.nomeacao.api.dto.ResumoHistoricoDTO(
            r.materia.id,
            SUM(CAST(r.minutos AS double)) / 60.0,
            SUM(CAST(r.questoesFeitas AS long))
        )
        FROM RegistroEstudo r
        WHERE r.concurso.id = :concursoId
        GROUP BY r.materia.id
    """)
    List<com.nomeacao.api.dto.ResumoHistoricoDTO> somarEstudosPorConcurso(Long concursoId);

}