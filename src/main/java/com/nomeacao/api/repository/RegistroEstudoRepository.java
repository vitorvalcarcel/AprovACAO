package com.nomeacao.api.repository;

import com.nomeacao.api.model.RegistroEstudo;
import com.nomeacao.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistroEstudoRepository extends JpaRepository<RegistroEstudo, Long> {
    List<RegistroEstudo> findAllByUsuarioOrderByDataInicioDesc(Usuario usuario);
    // Futuro: findAllByConcursoId(Long concursoId);
}