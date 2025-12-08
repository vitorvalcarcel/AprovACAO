package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosDetalhamentoVinculo;
import com.nomeacao.api.dto.DadosVinculoMateria;
import com.nomeacao.api.dto.DadosAtualizacaoVinculo;
import com.nomeacao.api.model.ConcursoMateria;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.ConcursoMateriaRepository;
import com.nomeacao.api.repository.ConcursoRepository;
import com.nomeacao.api.repository.MateriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ConcursoMateriaService {

    @Autowired
    private ConcursoMateriaRepository repository;

    @Autowired
    private ConcursoRepository concursoRepository;

    @Autowired
    private MateriaRepository materiaRepository;

    public DadosDetalhamentoVinculo vincular(Long concursoId, DadosVinculoMateria dados, Usuario usuario) {
        var concurso = concursoRepository.findById(concursoId)
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));

        if (!concurso.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Este concurso não pertence a você!");
        }

        var materia = materiaRepository.findById(dados.materiaId())
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        if (!materia.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Esta matéria não pertence a você!");
        }

        if (repository.existsByConcursoIdAndMateriaId(concurso.getId(), materia.getId())) {
            throw new RuntimeException("Esta matéria já está vinculada a este concurso!");
        }
        var vinculo = new ConcursoMateria();
        vinculo.setConcurso(concurso);
        vinculo.setMateria(materia);
        vinculo.setPeso(dados.peso());
        vinculo.setQuestoesProva(dados.questoesProva());

        repository.save(vinculo);

        return new DadosDetalhamentoVinculo(vinculo);
    }

    public DadosDetalhamentoVinculo atualizar(DadosAtualizacaoVinculo dados, Usuario usuario) {
        var vinculo = repository.findById(dados.id())
                .orElseThrow(() -> new RuntimeException("Vínculo não encontrado"));

        if (!vinculo.getConcurso().getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado!");
        }

        if (dados.peso() != null) {
            vinculo.setPeso(dados.peso());
        }
        if (dados.questoesProva() != null) {
            vinculo.setQuestoesProva(dados.questoesProva());
        }

        repository.save(vinculo);

        return new DadosDetalhamentoVinculo(vinculo);
    }

}