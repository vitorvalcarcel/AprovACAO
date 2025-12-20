package com.nomeacao.api.repository;

import com.nomeacao.api.model.Topico;
import com.nomeacao.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TopicoRepository extends JpaRepository<Topico, Long> {

    List<Topico> findAllByMateriaId(Long materiaId);
    
    List<Topico> findAllByMateriaIdAndArquivadoFalse(Long materiaId);

    @Query("SELECT t FROM Topico t JOIN FETCH t.materia m WHERE m.usuario = :usuario AND t.arquivado = false ORDER BY m.nome ASC, t.nome ASC")
    List<Topico> findAllByUsuarioComMateria(@Param("usuario") Usuario usuario);
}