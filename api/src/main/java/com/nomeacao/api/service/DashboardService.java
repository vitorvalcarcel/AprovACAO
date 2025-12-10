package com.nomeacao.api.service;

import com.nomeacao.api.dto.DashboardDTO;
import com.nomeacao.api.dto.ResumoHistoricoDTO;
import com.nomeacao.api.model.*;
import com.nomeacao.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
        double horasLiquidas = Math.round((totalSegundosResumo / 3600.0) * 100.0) / 100.0; // Mantém decimal para o card de cima
        
        int totalQuestoes = listaFiltrada.stream().mapToInt(RegistroEstudo::getQuestoesFeitas).sum();
        int totalAcertos = listaFiltrada.stream().mapToInt(RegistroEstudo::getQuestoesCertas).sum();
        double taxaAcertos = totalQuestoes > 0 ? (double) totalAcertos / totalQuestoes * 100.0 : 0.0;
        taxaAcertos = Math.round(taxaAcertos * 10.0) / 10.0;

        var cicloOpt = cicloRepository.findFirstByUsuarioAndAtivoTrue(usuario);
        
        if (cicloOpt.isEmpty()) {
            return new DashboardDTO(horasLiquidas, totalQuestoes, taxaAcertos, null, null, 0.0, List.of());
        }

        Ciclo ciclo = cicloOpt.get();
        
        Map<Long, Long> segundosPorMateria = registroRepository.somarEstudosPorConcurso(ciclo.getConcurso().getId())
                .stream()
                .collect(Collectors.toMap(ResumoHistoricoDTO::materiaId, ResumoHistoricoDTO::totalSegundos));

        List<DashboardDTO.ItemProgresso> itens = new ArrayList<>();
        double totalMetaSegundos = 0;
        double totalRealizadoSegundos = 0;

        for (ItemCiclo item : ciclo.getItens()) {
            long realizadoSeg = segundosPorMateria.getOrDefault(item.getMateria().getId(), 0L);
            
            double metaHoras = item.getHorasMeta();
            long metaSegundos = (long) (metaHoras * 3600); 
            
            long saldoSeg = metaSegundos - realizadoSeg;
            
            double percentual = metaSegundos > 0 ? ((double) realizadoSeg / metaSegundos) * 100.0 : 0.0;
            if (percentual > 100.0) percentual = 100.0;

            totalMetaSegundos += metaSegundos;
            totalRealizadoSegundos += Math.min(realizadoSeg, metaSegundos);

            itens.add(new DashboardDTO.ItemProgresso(
                item.getMateria().getNome(),
                metaHoras,
                realizadoSeg,
                saldoSeg,
                Math.round(percentual * 10.0) / 10.0
            ));
        }
        
        itens.sort((a, b) -> b.saldoSegundos().compareTo(a.saldoSegundos()));
        
        double progressoGeral = totalMetaSegundos > 0 ? (totalRealizadoSegundos / totalMetaSegundos) * 100.0 : 0.0;

        return new DashboardDTO(
            horasLiquidas, totalQuestoes, taxaAcertos,
            ciclo.getId(), ciclo.getConcurso().getNome(),
            Math.round(progressoGeral * 10.0) / 10.0,
            itens
        );
    }
}