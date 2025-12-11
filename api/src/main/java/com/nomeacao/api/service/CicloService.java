package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosCriacaoCiclo;
import com.nomeacao.api.dto.DadosSugestaoCiclo;
import com.nomeacao.api.model.*;
import com.nomeacao.api.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Comparator;

@Service
public class CicloService {

    @Autowired private CicloRepository repository;
    @Autowired private ConcursoRepository concursoRepository;
    @Autowired private ConcursoMateriaRepository concursoMateriaRepository;
    @Autowired private MateriaRepository materiaRepository;

    // 1. Gera apenas a sugestão matemática (não salva nada)
    public List<DadosSugestaoCiclo> sugerir(Long concursoId, Double horasMeta, Integer questoesMeta) {
        List<ConcursoMateria> materias = concursoMateriaRepository.findAllByConcursoId(concursoId);
        if (materias.isEmpty()) throw new RuntimeException("Este concurso não possui matérias cadastradas.");

        double somaPesos = materias.stream().mapToDouble(ConcursoMateria::getPeso).sum();
        if (somaPesos == 0) somaPesos = 1;

        List<DadosSugestaoCiclo> sugestao = new ArrayList<>();
        
        // Garante que questoesMeta não seja nulo para o cálculo
        int qMeta = (questoesMeta != null) ? questoesMeta : 0;

        for (ConcursoMateria cm : materias) {
            double pesoRelativo = cm.getPeso() / somaPesos;
            
            double hSugeridas = Math.round((horasMeta * pesoRelativo) * 10.0) / 10.0; // 1 casa decimal
            int qSugeridas = (int) Math.ceil(qMeta * pesoRelativo); // Arredonda pra cima

            sugestao.add(new DadosSugestaoCiclo(
                cm.getMateria().getId(),
                cm.getMateria().getNome(),
                cm.getPeso(),
                hSugeridas,
                qSugeridas,
                pesoRelativo * 100.0
            ));
        }
        
        // Ordena por maior carga horária
        sugestao.sort(Comparator.comparing(DadosSugestaoCiclo::horasSugeridas).reversed());
        return sugestao;
    }

    // 2. Salva o ciclo definitivo (com os itens que o usuário editou)
    @Transactional
    public void gerarCiclo(DadosCriacaoCiclo dados, Usuario usuario) {
        var concurso = concursoRepository.findById(dados.concursoId())
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));

        if (!concurso.getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso negado.");

        // Desativa anterior
        repository.findFirstByUsuarioAndAtivoTrue(usuario).ifPresent(c -> {
            c.setAtivo(false);
            repository.save(c);
        });

        var ciclo = new Ciclo();
        ciclo.setConcurso(concurso);
        ciclo.setAtivo(true);
        
        List<ItemCiclo> itensEntidade = new ArrayList<>();
        
        if (dados.itens() != null) {
            for (var itemDto : dados.itens()) {
                var materia = materiaRepository.findById(itemDto.materiaId()).orElseThrow();
                
                var item = new ItemCiclo();
                item.setCiclo(ciclo);
                item.setMateria(materia);
                item.setHorasMeta(itemDto.horasMeta());
                item.setQuestoesMeta(itemDto.questoesMeta() != null ? itemDto.questoesMeta() : 0);
                item.setOrdem(itemDto.ordem());
                
                itensEntidade.add(item);
            }
        }

        ciclo.setItens(itensEntidade);
        repository.save(ciclo);
    }
}