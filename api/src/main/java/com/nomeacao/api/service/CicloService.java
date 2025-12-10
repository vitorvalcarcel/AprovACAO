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

@Service
public class CicloService {

    @Autowired
    private CicloRepository repository;

    @Autowired
    private ConcursoRepository concursoRepository;

    @Autowired
    private ConcursoMateriaRepository vinculoRepository;

    @Autowired
    private MateriaRepository materiaRepository;

    // 1. GERAR SUGESTÃO (Cálculo Matemático)
    public List<DadosSugestaoCiclo> sugerirCiclo(Long concursoId, Double horasMeta, Usuario usuario) {
        var concurso = concursoRepository.findById(concursoId)
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));
        
        if (!concurso.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado!");
        }

        var vinculos = vinculoRepository.findAllByConcursoId(concursoId);
        if (vinculos.isEmpty()) {
            throw new RuntimeException("Adicione disciplinas ao concurso antes de gerar o ciclo.");
        }

        // Soma total de pontos (Peso * Questões)
        double pontuacaoTotal = vinculos.stream()
                .mapToDouble(v -> v.getPeso() * v.getQuestoesProva())
                .sum();

        if (pontuacaoTotal == 0) {
            throw new RuntimeException("Os pesos e questões estão zerados. Ajuste as disciplinas.");
        }

        List<DadosSugestaoCiclo> sugestao = new ArrayList<>();
        
        for (ConcursoMateria v : vinculos) {
            double score = v.getPeso() * v.getQuestoesProva();
            double proporcao = score / pontuacaoTotal;
            
            // Regra de 3 para horas
            double horas = Math.round((horasMeta * proporcao) * 100.0) / 100.0;
            double percentual = Math.round(proporcao * 100.0 * 10.0) / 10.0;

            sugestao.add(new DadosSugestaoCiclo(
                v.getMateria().getId(),
                v.getMateria().getNome(),
                v.getPeso(),
                v.getQuestoesProva(),
                horas,
                percentual
            ));
        }
        
        // Ordena por quem tem mais horas primeiro
        sugestao.sort((a, b) -> b.horasSugeridas().compareTo(a.horasSugeridas()));
        return sugestao;
    }

    // 2. SALVAR CICLO
    @Transactional
    public void criarCiclo(DadosCriacaoCiclo dados, Usuario usuario) {
        var concurso = concursoRepository.findById(dados.concursoId())
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));

        if (!concurso.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado!");
        }

        // Desativa ciclo anterior se existir
        repository.findByConcursoIdAndAtivoTrue(concurso.getId())
                .ifPresent(c -> c.setAtivo(false));

        var ciclo = new Ciclo();
        ciclo.setConcurso(concurso);
        ciclo.setDescricao(dados.descricao());
        ciclo.setTotalHoras(dados.totalHoras());
        ciclo.setAtivo(true);

        // Adiciona os itens aprovados pelo usuário
        for (var itemDto : dados.itens()) {
            var materia = materiaRepository.getReferenceById(itemDto.materiaId());
            
            var item = new ItemCiclo();
            item.setMateria(materia);
            item.setHorasMeta(itemDto.horasMeta());
            item.setOrdem(itemDto.ordem());
            
            ciclo.adicionarItem(item); // Usa o método do Model
        }

        repository.save(ciclo);
    }
}