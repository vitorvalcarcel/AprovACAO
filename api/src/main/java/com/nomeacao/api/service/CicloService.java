package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosCriacaoCiclo;
import com.nomeacao.api.dto.DadosSugestaoCiclo;
import com.nomeacao.api.dto.DashboardDTO;
import com.nomeacao.api.dto.ResumoHistoricoDTO;
import com.nomeacao.api.model.*;
import com.nomeacao.api.repository.CicloRepository;
import com.nomeacao.api.repository.ConcursoMateriaRepository;
import com.nomeacao.api.repository.ConcursoRepository;
import com.nomeacao.api.repository.CicloHistoricoRepository;
import com.nomeacao.api.repository.RegistroEstudoRepository;
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
    @Autowired private RegistroEstudoRepository registroRepository;
    @Autowired private CicloHistoricoRepository historicoRepository;

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

    public DashboardDTO calcularProgresso(Long concursoId, Usuario usuario) {
        var cicloAtual = repository.findByConcursoIdAndAtivoTrue(concursoId)
                .orElseThrow(() -> new RuntimeException("Nenhum ciclo ativo para este concurso."));
        
        if (!cicloAtual.getConcurso().getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso Negado");

        var totalEstudado = registroRepository.somarEstudosPorConcurso(concursoId);
        var totalDescontado = historicoRepository.somarDescontosPorConcurso(concursoId);

        List<DashboardDTO.ItemDashboard> itensDash = new ArrayList<>();
        double totalMetaCiclo = 0;
        double totalSaldoCiclo = 0;

        for (var itemMeta : cicloAtual.getItens()) {
            Long matId = itemMeta.getMateria().getId();
            
            double horasTotais = totalEstudado.stream().filter(e -> e.materiaId().equals(matId))
                    .findFirst().map(ResumoHistoricoDTO::totalHoras).orElse(0.0);
            
            double horasDescontadas = totalDescontado.stream().filter(h -> h.materiaId().equals(matId))
                    .findFirst().map(ResumoHistoricoDTO::totalHoras).orElse(0.0);

            double saldoAtual = Math.max(0, horasTotais - horasDescontadas);
            double percentual = itemMeta.getHorasMeta() > 0 ? (saldoAtual / itemMeta.getHorasMeta()) * 100 : 0;
            if (percentual > 100) percentual = 100;

            itensDash.add(new DashboardDTO.ItemDashboard(
                    itemMeta.getMateria().getNome(),
                    itemMeta.getHorasMeta(),
                    horasTotais,
                    saldoAtual,
                    percentual
            ));

            totalMetaCiclo += itemMeta.getHorasMeta();
            totalSaldoCiclo += Math.min(saldoAtual, itemMeta.getHorasMeta()); // Soma só até o limite da meta para o geral
        }

        double progressoGeral = totalMetaCiclo > 0 ? (totalSaldoCiclo / totalMetaCiclo) * 100 : 0;

        return new DashboardDTO(
                cicloAtual.getId(),
                cicloAtual.getConcurso().getNome(),
                progressoGeral,
                itensDash
        );
    }

    @Transactional
    public void fecharCiclo(Long cicloId, Usuario usuario) {
        var ciclo = repository.findById(cicloId).orElseThrow(() -> new RuntimeException("Ciclo não encontrado"));
        if (!ciclo.getConcurso().getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso Negado");
        if (!ciclo.getAtivo()) throw new RuntimeException("Ciclo já está fechado!");

        var dashboard = calcularProgresso(ciclo.getConcurso().getId(), usuario);

        for (var itemDash : dashboard.itens()) {
            var itemOriginal = ciclo.getItens().stream()
                    .filter(i -> i.getMateria().getNome().equals(itemDash.nomeMateria()))
                    .findFirst().orElseThrow();

            var historico = new CicloHistorico();
            historico.setCiclo(ciclo);
            historico.setMateria(itemOriginal.getMateria());
            
            double aDescontar = Math.min(itemDash.horasSaldoAtual(), itemDash.metaHoras());
            
            historico.setHorasDescontadas(aDescontar);
            // Implementar mesma lógica de horas para questões.
            historico.setQuestoesDescontadas(0);

            historicoRepository.save(historico);
        }

        ciclo.setAtivo(false); // Fecha o ciclo
        repository.save(ciclo);
    }

}