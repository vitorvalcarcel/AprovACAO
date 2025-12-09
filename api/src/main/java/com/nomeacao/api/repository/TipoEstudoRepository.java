package com.nomeacao.api.repository;

import com.nomeacao.api.model.TipoEstudo;
import com.nomeacao.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TipoEstudoRepository extends JpaRepository<TipoEstudo, Long> {
    List<TipoEstudo> findAllByUsuario(Usuario usuario);
}