package com.nomeacao.api.repository;

import com.nomeacao.api.model.Concurso;
import com.nomeacao.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConcursoRepository extends JpaRepository<Concurso, Long> {
    List<Concurso> findAllByUsuario(Usuario usuario);
    
    boolean existsByUsuarioIdAndNomeIgnoreCase(Long usuarioId, String nome);
}