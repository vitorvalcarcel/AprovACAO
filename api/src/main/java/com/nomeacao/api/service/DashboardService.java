package com.nomeacao.api.service;

import com.nomeacao.api.dto.DashboardDTO;
import com.nomeacao.api.dto.DadosGrafico;
import com.nomeacao.api.dto.EvolucaoDiariaDTO;
import com.nomeacao.api.dto.ResumoGeralDTO;
import com.nomeacao.api.dto.ResumoHistoricoDTO;
import com.nomeacao.api.model.*;
import com.nomeacao.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired private RegistroEstudoRepository registroRepository;
    @Autowired private CicloRepository cicloRepository;

    public DashboardDTO carregarDashboard(
            Usuario usuario,
            LocalDateTime inicio, LocalDateTime fim,
            List<Long> materias, List<Long> concursos, List<Long> tipos
    ) {
        // --- 1. FILTROS E RESUMO (OTIMIZADO) ---
        List<Long> listaMaterias = (materias != null && !materias.isEmpty()) ? materias : null;
        List<Long> listaConcursos = (concursos != null && !concursos.isEmpty()) ? concursos : null;
        List<Long> listaTipos = (tipos != null && !tipos.isEmpty()) ? tipos : null;

        ResumoGeralDTO resumo = registroRepository.calcularResumoGeral(
            usuario, inicio, fim, listaMaterias, listaConcursos, listaTipos
        );

        double totalSegundosResumo = resumo.totalSegundos() != null ? resumo.totalSegundos() : 0.0;
        double horasLiquidas = Math.round((totalSegundosResumo / 3600.0) * 100.0) / 100.0;
        
        int totalQuestoes = resumo.totalQuestoes() != null ? resumo.totalQuestoes().intValue() : 0;
        int totalAcertos = resumo.totalAcertos() != null ? resumo.totalAcertos().intValue() : 0;
        
        double taxaAcertos = totalQuestoes > 0 ? (double) totalAcertos / totalQuestoes * 100.0 : 0.0;
        taxaAcertos = Math.round(taxaAcertos * 10.0) / 10.0;

        // --- GRÁFICO EVOLUÇÃO (OTIMIZADO) ---
        List<EvolucaoDiariaDTO> evolucaoBanco = registroRepository.calcularEvolucaoDiaria(
            usuario, inicio, fim, listaMaterias, listaConcursos, listaTipos
        );

        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM");
        List<DadosGrafico> evolucao = evolucaoBanco.stream()
                .map(dto -> {
                    String label = sdf.format(dto.data());
                    Double horasDia = Math.round((dto.totalSegundos() / 3600.0) * 100.0) / 100.0;
                    return new DadosGrafico(label, horasDia);
                })
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

            // Busca os totais do histórico para o ciclo
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