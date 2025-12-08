package com.nomeacao.api.repository;

import com.nomeacao.api.model.Topico;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TopicoRepository extends JpaRepository<Topico, Long> {
    // Buscar todos os tópicos de uma matéria específica
    List<Topico> findAllByMateriaId(Long materiaId);
}