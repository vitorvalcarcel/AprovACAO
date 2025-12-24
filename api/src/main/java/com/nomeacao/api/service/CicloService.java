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

    @Autowired
    private CicloRepository repository;
    @Autowired
    private ConcursoRepository concursoRepository;
    @Autowired
    private ConcursoMateriaRepository concursoMateriaRepository;
    @Autowired
    private MateriaRepository materiaRepository;
    @Autowired
    private RegistroEstudoRepository registroRepository;

    // Classe auxiliar interna para o cálculo mutável
    private static class CalculoItem {
        ConcursoMateria cm;
        double score;
        double horasCalculadas;
        double restoHoras;
        int questoesCalculadas;
        double restoQuestoes;

        public CalculoItem(ConcursoMateria cm) {
            this.cm = cm;
            this.score = cm.getPeso() * cm.getQuestoesProva();
        }
    }

    // 1. Gera sugestão baseada no Método de Hamilton com Passos Discretos
    // 1. Gera sugestão baseada no Método de Hamilton com Passos Discretos
    public List<DadosSugestaoCiclo> sugerir(Long concursoId, Double horasMeta, Integer questoesMeta,
            Double horasDiscursiva) {
        List<ConcursoMateria> todasMaterias = concursoMateriaRepository.findAllByConcursoId(concursoId);
        if (todasMaterias.isEmpty())
            throw new RuntimeException("Este concurso não possui matérias cadastradas.");

        // Separação: Gerais vs Discursiva
        List<ConcursoMateria> materiasGerais = todasMaterias.stream()
                .filter(cm -> cm.getMateria().getTipo() == TipoMateria.GERAL)
                .toList();

        List<ConcursoMateria> materiasDiscursiva = todasMaterias.stream()
                .filter(cm -> cm.getMateria().getTipo() == TipoMateria.DISCURSIVA)
                .toList();

        List<DadosSugestaoCiclo> sugestaoFinal = new ArrayList<>();

        // -- PARTE 1: MATÉRIAS GERAIS (Lógica Original) --
        if (!materiasGerais.isEmpty()) {
            // Passo A: Constantes
            final double PASSO_HORAS = 0.5;
            final int PASSO_QUESTOES = 5;

            // Passo B: Score e Inicialização
            List<CalculoItem> itens = materiasGerais.stream().map(CalculoItem::new).toList();
            double scoreTotal = itens.stream().mapToDouble(i -> i.score).sum();
            if (scoreTotal == 0)
                scoreTotal = 1;

            // Passo C: Distribuição Inicial (Piso)
            int qMeta = (questoesMeta != null) ? questoesMeta : 0;
            // IMPORTANTE: horasMeta aqui refere-se APENAS às horas de teoria (gerais)

            for (CalculoItem item : itens) {
                // Horas
                double horasIdeais = (item.score / scoreTotal) * horasMeta;
                item.horasCalculadas = Math.floor(horasIdeais / PASSO_HORAS) * PASSO_HORAS;
                item.restoHoras = horasIdeais - item.horasCalculadas;

                // Questões
                if (qMeta > 0) {
                    double questoesIdeais = (item.score / scoreTotal) * qMeta;
                    item.questoesCalculadas = (int) (Math.floor(questoesIdeais / PASSO_QUESTOES) * PASSO_QUESTOES);
                    item.restoQuestoes = questoesIdeais - item.questoesCalculadas;
                } else {
                    item.questoesCalculadas = 0;
                    item.restoQuestoes = 0;
                }
            }

            // Passo D: Cálculo do Saldo
            double somaHoras = itens.stream().mapToDouble(i -> i.horasCalculadas).sum();
            double saldoHoras = horasMeta - somaHoras;
            saldoHoras = Math.round(saldoHoras * 10.0) / 10.0;

            int somaQuestoes = itens.stream().mapToInt(i -> i.questoesCalculadas).sum();
            int saldoQuestoes = qMeta - somaQuestoes;

            // Passo E: Distribuição do Saldo - Horas
            while (saldoHoras >= PASSO_HORAS) {
                List<CalculoItem> zerados = itens.stream()
                        .filter(i -> i.horasCalculadas == 0)
                        .sorted(Comparator.comparingDouble((CalculoItem i) -> i.score).reversed())
                        .toList();

                CalculoItem escolhido;
                if (!zerados.isEmpty()) {
                    escolhido = zerados.get(0);
                } else {
                    escolhido = itens.stream()
                            .max(Comparator.comparingDouble(i -> i.restoHoras))
                            .orElse(itens.get(0));
                }

                escolhido.horasCalculadas += PASSO_HORAS;
                escolhido.restoHoras = -1.0;

                saldoHoras -= PASSO_HORAS;
                saldoHoras = Math.round(saldoHoras * 10.0) / 10.0;
            }

            // Passo E: Distribuição do Saldo - Questões
            while (saldoQuestoes >= PASSO_QUESTOES) {
                List<CalculoItem> zerados = itens.stream()
                        .filter(i -> i.questoesCalculadas == 0)
                        .sorted(Comparator.comparingDouble((CalculoItem i) -> i.score).reversed())
                        .toList();

                CalculoItem escolhido;
                if (!zerados.isEmpty()) {
                    escolhido = zerados.get(0);
                } else {
                    escolhido = itens.stream()
                            .max(Comparator.comparingDouble(i -> i.restoQuestoes))
                            .orElse(itens.get(0));
                }

                escolhido.questoesCalculadas += PASSO_QUESTOES;
                escolhido.restoQuestoes = -1.0;
                saldoQuestoes -= PASSO_QUESTOES;
            }

            // Conversão Gerais
            for (CalculoItem item : itens) {
                double percentual = (item.score / scoreTotal) * 100.0;
                sugestaoFinal.add(new DadosSugestaoCiclo(
                        item.cm.getMateria().getId(),
                        item.cm.getMateria().getNome(),
                        item.cm.getPeso(),
                        item.horasCalculadas,
                        item.questoesCalculadas,
                        percentual,
                        item.cm.getMateria().getTipo().toString()));
            }
        }

        // -- PARTE 2: DISCURSIVAS (Tempo Fixo) --
        if (!materiasDiscursiva.isEmpty()) {
            double horasFixas = (horasDiscursiva != null) ? horasDiscursiva : 0.0;

            // Se houver mais de uma discursiva (raro pelo sistema atual, mas possível),
            // dividimos o tempo ou atribuímos a todas?
            // A spec diz "Matéria Discursiva". Vamos assumir divisão igual se houver mais
            // de uma, ou aplicar o total na primeira.
            // Para segurança, vamos dividir igualmente.

            double horasPorMateria = horasFixas / materiasDiscursiva.size();
            // Arredondar para 0.5 step? O usuário define manual, talvez não precise. Mas o
            // ciclo usa steps.
            // Vamos manter raw por enquanto, ou arredondar. A spec diz "atribui esse valor
            // FIXO".

            for (ConcursoMateria cm : materiasDiscursiva) {
                sugestaoFinal.add(new DadosSugestaoCiclo(
                        cm.getMateria().getId(),
                        cm.getMateria().getNome(),
                        cm.getPeso(), // Peso visual
                        horasPorMateria,
                        0, // Discursiva não tem meta de questões por enquanto? Spec diz "não adicionar
                           // colunas de meta por quantidade". User control via hours.
                        0.0, // Percentual de teoria? Null or 0.
                        cm.getMateria().getTipo().toString()));
            }
        }

        sugestaoFinal.sort(Comparator.comparing(DadosSugestaoCiclo::horasSugeridas).reversed());
        return sugestaoFinal;
    }

    // 2. Salva o ciclo definitivo
    @Transactional
    public void gerarCiclo(DadosCriacaoCiclo dados, Usuario usuario) {
        var concurso = concursoRepository.findById(dados.concursoId())
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));

        if (!concurso.getUsuario().getId().equals(usuario.getId()))
            throw new RuntimeException("Acesso negado.");

        // Desativa anterior e define data fim se não tiver
        repository.findFirstByUsuarioAndAtivoTrue(usuario).ifPresent(c -> {
            c.setAtivo(false);
            if (c.getDataFim() == null)
                c.setDataFim(LocalDateTime.now());
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

    // 3. Listar Histórico
    public List<DadosListagemCiclo> listarHistorico(Long concursoId, Usuario usuario) {
        var concurso = concursoRepository.findById(concursoId)
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));

        if (!concurso.getUsuario().getId().equals(usuario.getId()))
            throw new RuntimeException("Acesso negado.");

        List<Ciclo> ciclos = repository.findAllByConcursoIdOrderByDataInicioDesc(concursoId);

        return ciclos.stream()
                .map(c -> {
                    Double progresso = calcularProgressoReal(c, usuario.getId());
                    return new DadosListagemCiclo(c, progresso);
                })
                .toList();
    }

    private Double calcularProgressoReal(Ciclo ciclo, Long usuarioId) {
        if (ciclo.getItens() == null || ciclo.getItens().isEmpty())
            return 0.0;

        LocalDateTime fim = ciclo.getDataFim() != null ? ciclo.getDataFim() : LocalDateTime.now();

        double somaPercentuais = 0.0;
        int totalItens = 0;

        for (ItemCiclo item : ciclo.getItens()) {
            Long segundosRealizados = registroRepository.somarSegundosPorMateriaEPeriodo(
                    usuarioId,
                    item.getMateria().getId(),
                    ciclo.getDataInicio(),
                    fim);

            if (segundosRealizados == null)
                segundosRealizados = 0L;

            double metaSegundos = item.getHorasMeta() * 3600;
            double percentualItem = 0.0;

            if (metaSegundos > 0) {
                percentualItem = (segundosRealizados / metaSegundos) * 100.0;
                if (percentualItem > 100.0)
                    percentualItem = 100.0;
            }

            somaPercentuais += percentualItem;
            totalItens++;
        }

        if (totalItens == 0)
            return 0.0;
        return Math.round((somaPercentuais / totalItens) * 10.0) / 10.0;
    }

    // 4. Encerrar
    @Transactional
    public void encerrar(Long id, Usuario usuario) {
        var ciclo = repository.findById(id).orElseThrow(() -> new RuntimeException("Ciclo não encontrado"));

        if (!ciclo.getConcurso().getUsuario().getId().equals(usuario.getId()))
            throw new RuntimeException("Acesso negado.");

        if (!ciclo.getAtivo())
            throw new RuntimeException("Este ciclo já está encerrado.");

        ciclo.setAtivo(false);
        ciclo.setDataFim(LocalDateTime.now());
        repository.save(ciclo);
    }

    // 5. Excluir
    @Transactional
    public void excluir(Long id, Usuario usuario) {
        var ciclo = repository.findById(id).orElseThrow(() -> new RuntimeException("Ciclo não encontrado"));

        if (!ciclo.getConcurso().getUsuario().getId().equals(usuario.getId()))
            throw new RuntimeException("Acesso negado.");

        repository.delete(ciclo);
    }
}