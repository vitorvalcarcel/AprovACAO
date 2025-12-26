package com.nomeacao.api.service;

import com.nomeacao.api.dto.*;
import com.nomeacao.api.model.*;
import com.nomeacao.api.repository.CicloRepository;
import com.nomeacao.api.repository.RegistroEstudoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Date;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @InjectMocks
    private DashboardService service;

    @Mock
    private RegistroEstudoRepository registroRepository;

    @Mock
    private CicloRepository cicloRepository;

    // --- TESTES DE KPIs E GRÁFICOS ---

    @Test
    @DisplayName("DASHBOARD: Deve calcular KPIs gerais corretamente (Horas e Taxa Acerto)")
    void carregarDashboard_calculoKPIs() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);

        // Mock do Resumo Geral: 7200s (2h), 100 questões, 80 acertos (80%)
        ResumoGeralDTO resumoMock = new ResumoGeralDTO(7200L, 100L, 80L);

        // ATUALIZADO: Adicionado any() extra para o parâmetro 'topicos'
        when(registroRepository.calcularResumoGeral(
                eq(usuario), any(), any(), any(), any(), any(), any())).thenReturn(resumoMock);

        // ATUALIZADO: Adicionado any() extra para o parâmetro 'topicos'
        when(registroRepository.calcularEvolucaoDiaria(
                any(), any(), any(), any(), any(), any(), any())).thenReturn(Collections.emptyList());

        // Act
        // ATUALIZADO: Passando null para 'topicos' (5º argumento)
        DashboardDTO dashboard = service.carregarDashboard(usuario, null, null, null, null, null, null);

        // Assert
        assertEquals(7200L, dashboard.segundosLiquidos()); // 2h = 7200s
        assertEquals(80.0, dashboard.taxaAcertos()); // 80 / 100
        assertEquals(100, dashboard.questoesFeitas());
    }

    @Test
    @DisplayName("DASHBOARD: Deve preencher dias vazios no gráfico (Gap Filling)")
    void carregarDashboard_gapFilling() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);

        LocalDate hoje = LocalDate.now();
        LocalDate anteontem = hoje.minusDays(2);

        List<EvolucaoDiariaDTO> evolucaoBanco = List.of(
                new EvolucaoDiariaDTO(Date.valueOf(anteontem), 3600L), // 1h
                new EvolucaoDiariaDTO(Date.valueOf(hoje), 7200L) // 2h
        );

        // ATUALIZADO: Adicionado any() extra
        when(registroRepository.calcularResumoGeral(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new ResumoGeralDTO(0L, 0L, 0L));

        // ATUALIZADO: Adicionado any() extra
        when(registroRepository.calcularEvolucaoDiaria(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(evolucaoBanco);

        // Act
        // ATUALIZADO: Passando null para 'topicos'
        DashboardDTO dashboard = service.carregarDashboard(
                usuario,
                anteontem.atStartOfDay(),
                hoje.atTime(23, 59, 59),
                null, null, null, null);

        List<DadosGrafico> grafico = dashboard.evolucaoDiaria();

        // Assert
        assertEquals(3, grafico.size());

        assertEquals(3600L, grafico.get(0).valor()); // Anteontem
        assertEquals(0L, grafico.get(1).valor()); // Ontem (Preenchido automaticamente!)
        assertEquals(7200L, grafico.get(2).valor()); // Hoje
    }

    // --- TESTES DE CICLO E PROGRESSO ---

    @Test
    @DisplayName("DASHBOARD: Deve calcular progresso do Ciclo Ativo corretamente")
    void carregarDashboard_progressoCiclo() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);

        Concurso concurso = new Concurso();
        concurso.setId(10L);
        concurso.setNome("Concurso Teste");

        Materia mat1 = new Materia();
        mat1.setId(100L);
        mat1.setNome("Matéria 1");

        ItemCiclo item = new ItemCiclo();
        item.setMateria(mat1);
        item.setSegundosMeta(36000L); // 10h
        item.setQuestoesMeta(0);

        Ciclo ciclo = new Ciclo();
        ciclo.setId(50L);
        ciclo.setConcurso(concurso);
        ciclo.setItens(List.of(item));

        when(cicloRepository.findFirstByUsuarioAndAtivoTrue(usuario)).thenReturn(Optional.of(ciclo));

        ResumoHistoricoDTO historicoMat1 = new ResumoHistoricoDTO(100L, 18000L, 0L); // 5h feitas
        when(registroRepository.somarEstudosPorConcurso(10L)).thenReturn(List.of(historicoMat1));

        // ATUALIZADO: Adicionado any() extra
        when(registroRepository.calcularResumoGeral(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new ResumoGeralDTO(0L, 0L, 0L));
        // ATUALIZADO: Adicionado any() extra
        when(registroRepository.calcularEvolucaoDiaria(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());

        // Act
        // ATUALIZADO: Passando null para 'topicos'
        DashboardDTO dashboard = service.carregarDashboard(usuario, null, null, null, null, null, null);

        // Assert
        assertNotNull(dashboard.cicloId());
        assertEquals("Concurso Teste", dashboard.nomeConcurso());
        assertEquals(1, dashboard.itens().size());

        DashboardDTO.ItemProgresso itemProg = dashboard.itens().get(0);
        assertEquals(50.0, itemProg.percentualHoras());
        assertEquals(18000L, itemProg.saldoSegundos());

        assertEquals(50.0, dashboard.progressoGeral());
    }

    @Test
    @DisplayName("DASHBOARD: Deve retornar zerado se não houver dados")
    void carregarDashboard_semDados() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);

        // ATUALIZADO: Adicionado any() extra
        when(registroRepository.calcularResumoGeral(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new ResumoGeralDTO(null, null, null));

        // ATUALIZADO: Adicionado any() extra
        when(registroRepository.calcularEvolucaoDiaria(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());

        when(cicloRepository.findFirstByUsuarioAndAtivoTrue(usuario)).thenReturn(Optional.empty());

        // Act
        // ATUALIZADO: Passando null para 'topicos'
        DashboardDTO dashboard = service.carregarDashboard(usuario, null, null, null, null, null, null);

        assertEquals(0L, dashboard.segundosLiquidos());
        assertEquals(0, dashboard.questoesFeitas());
        assertNull(dashboard.cicloId());
    }
}