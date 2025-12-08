package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosCriacaoCiclo;
import com.nomeacao.api.dto.DadosSugestaoCiclo;
import com.nomeacao.api.model.*;
import com.nomeacao.api.repository.CicloRepository;
import com.nomeacao.api.repository.ConcursoMateriaRepository;
import com.nomeacao.api.repository.ConcursoRepository;
import com.nomeacao.api.repository.MateriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CicloService {

    @Autowired private CicloRepository repository;
    @Autowired private ConcursoRepository concursoRepository;
    @Autowired private ConcursoMateriaRepository vinculoRepository;
    @Autowired private MateriaRepository materiaRepository;

    public DadosSugestaoCiclo gerarSugestao(Long concursoId, Double horasTotais, Usuario usuario) {
        var concurso = concursoRepository.findById(concursoId)
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));
        
        if (!concurso.getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso Negado");

        var vinculos = vinculoRepository.findAllByConcursoId(concursoId);

        double pontuacaoTotalConcurso = vinculos.stream()
                .mapToDouble(v -> v.getPeso() * v.getQuestoesProva())
                .sum();

        if (pontuacaoTotalConcurso == 0) throw new RuntimeException("Configure os pesos e questões do concurso antes de criar um ciclo!");

        List<DadosSugestaoCiclo.ItemSugestao> itensSugestao = new ArrayList<>();
        
        for (var vinculo : vinculos) {
            double pontosMateria = vinculo.getPeso() * vinculo.getQuestoesProva();
            double porcentagem = pontosMateria / pontuacaoTotalConcurso;
            
            double horasSugeridas = horasTotais * porcentagem;

            itensSugestao.add(new DadosSugestaoCiclo.ItemSugestao(
                    vinculo.getMateria().getId(),
                    vinculo.getMateria().getNome(),
                    vinculo.getPeso(),
                    vinculo.getQuestoesProva(),
                    horasSugeridas
            ));
        }

        return new DadosSugestaoCiclo(concursoId, horasTotais, itensSugestao);
    }

    @Transactional
    public Long criarCiclo(DadosCriacaoCiclo dados, Usuario usuario) {
        if (repository.findByConcursoIdAndAtivoTrue(dados.concursoId()).isPresent()) {
            throw new RuntimeException("Já existe um ciclo ativo para este concurso. Finalize-o antes de criar outro.");
        }

        var concurso = concursoRepository.findById(dados.concursoId())
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));
        if (!concurso.getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso Negado");

        var ciclo = new Ciclo();
        ciclo.setConcurso(concurso);
        ciclo.setAnotacoes(dados.anotacoes());

        for (var itemMeta : dados.itens()) {
            var materia = materiaRepository.findById(itemMeta.materiaId())
                    .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));
            
            var itemCiclo = new ItemCiclo();
            itemCiclo.setMateria(materia);
            itemCiclo.setHorasMeta(itemMeta.horasMeta());
            
            ciclo.adicionarItem(itemCiclo);
        }

        repository.save(ciclo);
        return ciclo.getId();
    }
}