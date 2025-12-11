package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosGrafico;
import com.nomeacao.api.dto.DashboardDTO;
import com.nomeacao.api.dto.ResumoHistoricoDTO;
import com.nomeacao.api.model.*;
import com.nomeacao.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired private RegistroEstudoRepository registroRepository;
    @Autowired private CicloRepository cicloRepository;

    public DashboardDTO carregarDashboard(
            Usuario usuario,
            java.time.LocalDateTime inicio, java.time.LocalDateTime fim,
            List<Long> materias, List<Long> concursos, List<Long> tipos
    ) {
        // 1. Filtros e Resumo (Mantido igual)
        Specification<RegistroEstudo> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("usuario"), usuario));
            if (inicio != null) predicates.add(cb.greaterThanOrEqualTo(root.get("dataInicio"), inicio));
            if (fim != null) predicates.add(cb.lessThanOrEqualTo(root.get("dataInicio"), fim));
            if (materias != null && !materias.isEmpty()) predicates.add(root.get("materia").get("id").in(materias));
            if (concursos != null && !concursos.isEmpty()) predicates.add(root.get("concurso").get("id").in(concursos));
            if (tipos != null && !tipos.isEmpty()) predicates.add(root.get("tipoEstudo").get("id").in(tipos));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<RegistroEstudo> listaFiltrada = registroRepository.findAll(spec);

        double totalSegundosResumo = listaFiltrada.stream().mapToDouble(RegistroEstudo::getSegundos).sum();
        double horasLiquidas = Math.round((totalSegundosResumo / 3600.0) * 100.0) / 100.0;
        int totalQuestoes = listaFiltrada.stream().mapToInt(RegistroEstudo::getQuestoesFeitas).sum();
        int totalAcertos = listaFiltrada.stream().mapToInt(RegistroEstudo::getQuestoesCertas).sum();
        double taxaAcertos = totalQuestoes > 0 ? (double) totalAcertos / totalQuestoes * 100.0 : 0.0;
        taxaAcertos = Math.round(taxaAcertos * 10.0) / 10.0;

        // Gráfico Evolução (Mantido igual)
        Map<String, Double> mapaEvolucao = new TreeMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM");
        for (RegistroEstudo reg : listaFiltrada) {
            mapaEvolucao.merge(reg.getDataInicio().format(fmt), (double) reg.getSegundos() / 3600.0, Double::sum);
        }
        List<DadosGrafico> evolucao = mapaEvolucao.entrySet().stream()
                .map(e -> new DadosGrafico(e.getKey(), Math.round(e.getValue() * 100.0) / 100.0))
                .collect(Collectors.toList());

        // --- 2. CICLO ATIVO (Cálculo Duplo) ---
        List<DashboardDTO.ItemProgresso> itensCiclo = new ArrayList<>();
        Long cicloId = null;
        String nomeConcurso = null;
        double progressoGeral = 0.0;

        var cicloOpt = cicloRepository.findFirstByUsuarioAndAtivoTrue(usuario);
        if (cicloOpt.isPresent()) {
            Ciclo ciclo = cicloOpt.get();
            cicloId = ciclo.getId();
            nomeConcurso = ciclo.getConcurso().getNome();

            // Busca os totais do histórico (agora a query já separa horas válidas)
            List<ResumoHistoricoDTO> historico = registroRepository.somarEstudosPorConcurso(ciclo.getConcurso().getId());
            
            Map<Long, Long> segundosPorMateria = historico.stream()
                    .collect(Collectors.toMap(ResumoHistoricoDTO::materiaId, dto -> dto.totalSegundos() != null ? dto.totalSegundos() : 0L));
            
            Map<Long, Long> questoesPorMateria = historico.stream()
                    .collect(Collectors.toMap(ResumoHistoricoDTO::materiaId, dto -> dto.totalQuestoes() != null ? dto.totalQuestoes() : 0L));

            double somaPercentuais = 0;
            int totalItens = 0;

            for (ItemCiclo item : ciclo.getItens()) {
                // --- CÁLCULO HORAS ---
                long realizadoSeg = segundosPorMateria.getOrDefault(item.getMateria().getId(), 0L);
                double metaH = item.getHorasMeta();
                long metaS = (long) (metaH * 3600);
                long saldoS = metaS - realizadoSeg;
                double percH = metaS > 0 ? ((double) realizadoSeg / metaS) * 100.0 : 0.0;
                if (percH > 100.0) percH = 100.0;

                // --- CÁLCULO QUESTÕES ---
                long realizadoQ = questoesPorMateria.getOrDefault(item.getMateria().getId(), 0L);
                int metaQ = item.getQuestoesMeta() != null ? item.getQuestoesMeta() : 0;
                long saldoQ = metaQ - realizadoQ;
                double percQ = metaQ > 0 ? ((double) realizadoQ / metaQ) * 100.0 : 0.0;
                if (percQ > 100.0) percQ = 100.0;

                // Progresso Geral (Média simples dos dois progressos para este item)
                // Se não tiver meta de questões, conta só horas.
                double progressoItem = (metaQ > 0) ? (percH + percQ) / 2.0 : percH;
                somaPercentuais += progressoItem;
                totalItens++;

                itensCiclo.add(new DashboardDTO.ItemProgresso(
                    item.getMateria().getNome(),
                    metaH, realizadoSeg, saldoS, Math.round(percH * 10.0) / 10.0,
                    metaQ, realizadoQ, saldoQ, Math.round(percQ * 10.0) / 10.0
                ));
            }
            
            // Ordenação: Prioridade para quem deve mais horas
            itensCiclo.sort((a, b) -> b.saldoSegundos().compareTo(a.saldoSegundos()));
            
            if (totalItens > 0) {
                progressoGeral = Math.round((somaPercentuais / totalItens) * 10.0) / 10.0;
            }
        }

        return new DashboardDTO(
            horasLiquidas, totalQuestoes, taxaAcertos,
            cicloId, nomeConcurso, progressoGeral, evolucao, itensCiclo
        );
    }
}