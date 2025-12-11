package com.nomeacao.api.repository;

import com.nomeacao.api.dto.EvolucaoDiariaDTO;
import com.nomeacao.api.dto.ResumoGeralDTO;
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

    @Query("""
        SELECT new com.nomeacao.api.dto.ResumoGeralDTO(
            COALESCE(SUM(CAST(r.segundos AS long)), 0),
            COALESCE(SUM(CAST(r.questoesFeitas AS long)), 0),
            COALESCE(SUM(CAST(r.questoesCertas AS long)), 0)
        )
        FROM RegistroEstudo r
        WHERE r.usuario = :usuario
          AND (CAST(:inicio AS timestamp) IS NULL OR r.dataInicio >= :inicio)
          AND (CAST(:fim AS timestamp) IS NULL OR r.dataInicio <= :fim)
          AND ((:materias) IS NULL OR r.materia.id IN (:materias))
          AND ((:concursos) IS NULL OR r.concurso.id IN (:concursos))
          AND ((:tipos) IS NULL OR r.tipoEstudo.id IN (:tipos))
    """)
    ResumoGeralDTO calcularResumoGeral(
        @Param("usuario") Usuario usuario,
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim,
        @Param("materias") List<Long> materias,
        @Param("concursos") List<Long> concursos,
        @Param("tipos") List<Long> tipos
    );

    @Query("""
        SELECT new com.nomeacao.api.dto.EvolucaoDiariaDTO(
            CAST(r.dataInicio AS date),
            COALESCE(SUM(CAST(r.segundos AS long)), 0)
        )
        FROM RegistroEstudo r
        WHERE r.usuario = :usuario
          AND (CAST(:inicio AS timestamp) IS NULL OR r.dataInicio >= :inicio)
          AND (CAST(:fim AS timestamp) IS NULL OR r.dataInicio <= :fim)
          AND ((:materias) IS NULL OR r.materia.id IN (:materias))
          AND ((:concursos) IS NULL OR r.concurso.id IN (:concursos))
          AND ((:tipos) IS NULL OR r.tipoEstudo.id IN (:tipos))
        GROUP BY CAST(r.dataInicio AS date)
        ORDER BY CAST(r.dataInicio AS date) ASC
    """)
    List<EvolucaoDiariaDTO> calcularEvolucaoDiaria(
        @Param("usuario") Usuario usuario,
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim,
        @Param("materias") List<Long> materias,
        @Param("concursos") List<Long> concursos,
        @Param("tipos") List<Long> tipos
    );
}