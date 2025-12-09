package com.nomeacao.api.repository;

import com.nomeacao.api.model.Materia;
import com.nomeacao.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MateriaRepository extends JpaRepository<Materia, Long> {
    List<Materia> findAllByUsuario(Usuario usuario);
    
    boolean existsByUsuarioIdAndNomeIgnoreCase(Long usuarioId, String nome);
}