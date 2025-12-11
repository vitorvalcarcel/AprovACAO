package com.nomeacao.api.repository;

import com.nomeacao.api.model.RegistroEstudo;
import com.nomeacao.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RegistroEstudoRepository extends JpaRepository<RegistroEstudo, Long>, JpaSpecificationExecutor<RegistroEstudo> {

    List<RegistroEstudo> findAllByUsuarioOrderByDataInicioDesc(Usuario usuario);
    boolean existsByMateriaId(Long materiaId);
    boolean existsByTopicoId(Long topicoId);
    boolean existsByConcursoId(Long concursoId);
    boolean existsByTipoEstudoId(Long tipoEstudoId);
    void deleteAllByUsuario(Usuario usuario);

    @Query("""
        SELECT new com.nomeacao.api.dto.ResumoHistoricoDTO(
            r.materia.id,
            SUM(CASE WHEN r.contarHorasNoCiclo = true THEN CAST(r.segundos AS long) ELSE 0 END), 
            SUM(CAST(r.questoesFeitas AS long))
        )
        FROM RegistroEstudo r
        WHERE r.concurso.id = :concursoId
        GROUP BY r.materia.id
    """)
    List<com.nomeacao.api.dto.ResumoHistoricoDTO> somarEstudosPorConcurso(@Param("concursoId") Long concursoId);

    @Query("""
        SELECT SUM(r.segundos) 
        FROM RegistroEstudo r 
        WHERE r.usuario.id = :usuarioId 
          AND r.materia.id = :materiaId 
          AND r.dataInicio BETWEEN :inicio AND :fim 
          AND r.contarHorasNoCiclo = true
    """)
    Long somarSegundosPorMateriaEPeriodo(
        @Param("usuarioId") Long usuarioId, 
        @Param("materiaId") Long materiaId, 
        @Param("inicio") LocalDateTime inicio, 
        @Param("fim") LocalDateTime fim
    );
}