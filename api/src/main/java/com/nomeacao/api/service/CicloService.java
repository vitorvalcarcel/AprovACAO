package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosCriacaoCiclo;
import com.nomeacao.api.dto.DadosListagemCiclo;
import com.nomeacao.api.dto.DadosSugestaoCiclo;
import com.nomeacao.api.model.*;
import com.nomeacao.api.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class CicloService {

    @Autowired private CicloRepository repository;
    @Autowired private ConcursoRepository concursoRepository;
    @Autowired private ConcursoMateriaRepository concursoMateriaRepository;
    @Autowired private MateriaRepository materiaRepository;
    @Autowired private RegistroEstudoRepository registroRepository;

    // 1. Gera apenas a sugestão matemática (não salva nada)
    public List<DadosSugestaoCiclo> sugerir(Long concursoId, Double horasMeta, Integer questoesMeta) {
        List<ConcursoMateria> materias = concursoMateriaRepository.findAllByConcursoId(concursoId);
        if (materias.isEmpty()) throw new RuntimeException("Este concurso não possui matérias cadastradas.");

        double somaPesos = materias.stream().mapToDouble(ConcursoMateria::getPeso).sum();
        if (somaPesos == 0) somaPesos = 1;

        List<DadosSugestaoCiclo> sugestao = new ArrayList<>();
        
        int qMeta = (questoesMeta != null) ? questoesMeta : 0;

        for (ConcursoMateria cm : materias) {
            double pesoRelativo = cm.getPeso() / somaPesos;
            
            double hSugeridas = Math.round((horasMeta * pesoRelativo) * 10.0) / 10.0;
            int qSugeridas = (int) Math.ceil(qMeta * pesoRelativo);

            sugestao.add(new DadosSugestaoCiclo(
                cm.getMateria().getId(),
                cm.getMateria().getNome(),
                cm.getPeso(),
                hSugeridas,
                qSugeridas,
                pesoRelativo * 100.0
            ));
        }
        
        sugestao.sort(Comparator.comparing(DadosSugestaoCiclo::horasSugeridas).reversed());
        return sugestao;
    }

    // 2. Salva o ciclo definitivo
    @Transactional
    public void gerarCiclo(DadosCriacaoCiclo dados, Usuario usuario) {
        var concurso = concursoRepository.findById(dados.concursoId())
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));

        if (!concurso.getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso negado.");

        // Desativa anterior e define data fim se não tiver
        repository.findFirstByUsuarioAndAtivoTrue(usuario).ifPresent(c -> {
            c.setAtivo(false);
            if (c.getDataFim() == null) c.setDataFim(LocalDateTime.now());
            repository.save(c);
        });

        var ciclo = new Ciclo();
        ciclo.setConcurso(concurso);
        ciclo.setAtivo(true);
        ciclo.setDescricao(dados.descricao());
        ciclo.setTotalHoras(dados.totalHoras());
        ciclo.setDataInicio(LocalDateTime.now());
        
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

    // 3. Listar Histórico (Agora com cálculo real)
    public List<DadosListagemCiclo> listarHistorico(Long concursoId, Usuario usuario) {
        var concurso = concursoRepository.findById(concursoId)
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));
        
        if (!concurso.getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso negado.");

        List<Ciclo> ciclos = repository.findAllByConcursoIdOrderByDataInicioDesc(concursoId);
        
        return ciclos.stream()
                .map(c -> {
                    Double progresso = calcularProgressoReal(c, usuario.getId());
                    return new DadosListagemCiclo(c, progresso);
                })
                .toList();
    }

    // Método auxiliar privado para calcular a % do ciclo
    private Double calcularProgressoReal(Ciclo ciclo, Long usuarioId) {
        if (ciclo.getItens() == null || ciclo.getItens().isEmpty()) return 0.0;

        // Se o ciclo está ativo, a data fim é "agora". Se fechado, usa a dataFim salva.
        LocalDateTime fim = ciclo.getDataFim() != null ? ciclo.getDataFim() : LocalDateTime.now();
        
        double somaPercentuais = 0.0;
        int totalItens = 0;

        for (ItemCiclo item : ciclo.getItens()) {
            // Busca o total de segundos estudados para essa matéria NESTE intervalo de tempo
            Long segundosRealizados = registroRepository.somarSegundosPorMateriaEPeriodo(
                usuarioId,
                item.getMateria().getId(),
                ciclo.getDataInicio(),
                fim
            );

            if (segundosRealizados == null) segundosRealizados = 0L;

            // Calcula % da matéria
            double metaSegundos = item.getHorasMeta() * 3600;
            double percentualItem = 0.0;
            
            if (metaSegundos > 0) {
                percentualItem = (segundosRealizados / metaSegundos) * 100.0;
                if (percentualItem > 100.0) percentualItem = 100.0; // Teto de 100%
            }

            somaPercentuais += percentualItem;
            totalItens++;
        }

        if (totalItens == 0) return 0.0;

        // Média simples do progresso das matérias
        return Math.round((somaPercentuais / totalItens) * 10.0) / 10.0;
    }

    // 4. Encerrar
    @Transactional
    public void encerrar(Long id, Usuario usuario) {
        var ciclo = repository.findById(id).orElseThrow(() -> new RuntimeException("Ciclo não encontrado"));
        
        if (!ciclo.getConcurso().getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso negado.");
        
        if (!ciclo.getAtivo()) throw new RuntimeException("Este ciclo já está encerrado.");

        ciclo.setAtivo(false);
        ciclo.setDataFim(LocalDateTime.now());
        repository.save(ciclo);
    }

    // 5. Excluir
    @Transactional
    public void excluir(Long id, Usuario usuario) {
        var ciclo = repository.findById(id).orElseThrow(() -> new RuntimeException("Ciclo não encontrado"));
        
        if (!ciclo.getConcurso().getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso negado.");

        // O Cascade do Banco já cuida de apagar ItensCiclo e CicloHistorico
        repository.delete(ciclo);
    }
}