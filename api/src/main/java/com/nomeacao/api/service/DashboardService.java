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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private RegistroEstudoRepository registroRepository;
    @Autowired
    private CicloRepository cicloRepository;

    // ALTERADO: Adicionado List<Long> topicos
    public DashboardDTO carregarDashboard(
            Usuario usuario,
            LocalDateTime inicio, LocalDateTime fim,
            List<Long> materias, List<Long> topicos, List<Long> concursos, List<Long> tipos) {
        // --- 1. FILTROS E RESUMO (OTIMIZADO) ---
        List<Long> listaMaterias = (materias != null && !materias.isEmpty()) ? materias : null;
        List<Long> listaTopicos = (topicos != null && !topicos.isEmpty()) ? topicos : null; // Novo
        List<Long> listaConcursos = (concursos != null && !concursos.isEmpty()) ? concursos : null;
        List<Long> listaTipos = (tipos != null && !tipos.isEmpty()) ? tipos : null;

        ResumoGeralDTO resumo = registroRepository.calcularResumoGeral(
                usuario, inicio, fim, listaMaterias, listaTopicos, listaConcursos, listaTipos);

        Long totalSegundosResumo = resumo.totalSegundos() != null ? resumo.totalSegundos() : 0L;
        // Agora envia SEGUNDOS direto pro front
        Long segundosLiquidos = totalSegundosResumo;

        int totalQuestoes = resumo.totalQuestoes() != null ? resumo.totalQuestoes().intValue() : 0;
        int totalAcertos = resumo.totalAcertos() != null ? resumo.totalAcertos().intValue() : 0;

        double taxaAcertos = totalQuestoes > 0 ? (double) totalAcertos / totalQuestoes * 100.0 : 0.0;
        taxaAcertos = Math.round(taxaAcertos * 10.0) / 10.0;

        // --- GRÁFICO EVOLUÇÃO (Com Gap Filling) ---
        List<EvolucaoDiariaDTO> evolucaoBanco = registroRepository.calcularEvolucaoDiaria(
                usuario, inicio, fim, listaMaterias, listaTopicos, listaConcursos, listaTipos);

        // 1. Determinar Range de Datas
        LocalDate dataFim = (fim != null) ? fim.toLocalDate() : LocalDate.now();
        LocalDate dataInicio;

        if (inicio != null) {
            dataInicio = inicio.toLocalDate();
        } else if (!evolucaoBanco.isEmpty()) {
            // Se não tem filtro, pega a primeira data do banco
            dataInicio = evolucaoBanco.stream()
                    .map(e -> e.data().toLocalDate())
                    .min(LocalDate::compareTo)
                    .orElse(LocalDate.now().minusDays(30));
        } else {
            // Padrão: Últimos 30 dias se tudo estiver vazio
            dataInicio = LocalDate.now().minusDays(30);
        }

        // Garante que não exploda se o banco tiver datas muito antigas sem filtro
        // (trava em 2 anos)
        if (inicio == null && ChronoUnit.DAYS.between(dataInicio, dataFim) > 730) {
            dataInicio = dataFim.minusYears(2);
        }

        // 2. Mapear dados existentes
        // 2. Mapear dados existentes
        Map<LocalDate, Long> mapDados = evolucaoBanco.stream()
                .collect(Collectors.toMap(
                        e -> e.data().toLocalDate(),
                        EvolucaoDiariaDTO::totalSegundos,
                        (a, b) -> a));

        // 3. Preencher buracos (Gap Filling)
        List<DadosGrafico> evolucao = new ArrayList<>();
        LocalDate current = dataInicio;

        while (!current.isAfter(dataFim)) {
            Long valor = mapDados.getOrDefault(current, 0L);

            // Retorna ISO 8601 para o front tratar
            evolucao.add(new DadosGrafico(current.toString(), valor));
            current = current.plusDays(1);
        }

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

            List<ResumoHistoricoDTO> historico = registroRepository
                    .somarEstudosPorConcurso(ciclo.getConcurso().getId());

            Map<Long, Long> segundosPorMateria = historico.stream()
                    .collect(Collectors.toMap(ResumoHistoricoDTO::materiaId,
                            dto -> dto.totalSegundos() != null ? dto.totalSegundos() : 0L));

            Map<Long, Long> questoesPorMateria = historico.stream()
                    .collect(Collectors.toMap(ResumoHistoricoDTO::materiaId,
                            dto -> dto.totalQuestoes() != null ? dto.totalQuestoes() : 0L));

            double somaPercentuais = 0;
            int totalItens = 0;

            for (ItemCiclo item : ciclo.getItens()) {
                long realizadoSeg = segundosPorMateria.getOrDefault(item.getMateria().getId(), 0L);

                // NOVO: Lê segundos meta
                Long metaS = item.getSegundosMeta() != null ? item.getSegundosMeta() : 0L;

                long saldoS = metaS - realizadoSeg;
                double percH = metaS > 0 ? ((double) realizadoSeg / metaS) * 100.0 : 0.0;
                if (percH > 100.0)
                    percH = 100.0;

                long realizadoQ = questoesPorMateria.getOrDefault(item.getMateria().getId(), 0L);
                int metaQ = item.getQuestoesMeta() != null ? item.getQuestoesMeta() : 0;
                long saldoQ = metaQ - realizadoQ;
                double percQ = metaQ > 0 ? ((double) realizadoQ / metaQ) * 100.0 : 0.0;
                if (percQ > 100.0)
                    percQ = 100.0;

                double progressoItem = (metaQ > 0) ? (percH + percQ) / 2.0 : percH;
                somaPercentuais += progressoItem;
                totalItens++;

                itensCiclo.add(new DashboardDTO.ItemProgresso(
                        item.getMateria().getNome(),
                        metaS, realizadoSeg, saldoS, Math.round(percH * 10.0) / 10.0,
                        metaQ, realizadoQ, saldoQ, Math.round(percQ * 10.0) / 10.0));
            }

            itensCiclo.sort((a, b) -> b.saldoSegundos().compareTo(a.saldoSegundos()));

            if (totalItens > 0) {
                progressoGeral = Math.round((somaPercentuais / totalItens) * 10.0) / 10.0;
            }
        }

        return new DashboardDTO(
                segundosLiquidos, totalQuestoes, taxaAcertos,
                cicloId, nomeConcurso, progressoGeral, evolucao, itensCiclo);
    }
}