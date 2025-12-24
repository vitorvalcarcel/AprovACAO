package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosCriacaoCiclo;
import com.nomeacao.api.dto.DadosSugestaoCiclo;
import com.nomeacao.api.model.*;
import com.nomeacao.api.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CicloServiceTest {

    @InjectMocks
    private CicloService cicloService;

    @Mock
    private CicloRepository cicloRepository;

    @Mock
    private ConcursoRepository concursoRepository;

    @Mock
    private ConcursoMateriaRepository concursoMateriaRepository;

    @Mock
    private MateriaRepository materiaRepository;

    @Mock
    private RegistroEstudoRepository registroRepository;

    // --- TESTES DE SUGESTÃO (ALGORITMO) ---

    @Test
    @DisplayName("SUGERIR: Deve distribuir horas corretamente (Método de Hamilton)")
    void sugerir_deveDistribuirHorasCorretamente() {
        // Arrange
        Long concursoId = 1L;
        Double horasMeta = 10.0;
        Integer questoesMeta = 50;

        Materia m1 = new Materia();
        m1.setId(1L);
        m1.setNome("Portugues");
        Materia m2 = new Materia();
        m2.setId(2L);
        m2.setNome("Direito");

        ConcursoMateria cm1 = new ConcursoMateria();
        cm1.setMateria(m1);
        cm1.setPeso(1.0);
        cm1.setQuestoesProva(10); // Score 10

        ConcursoMateria cm2 = new ConcursoMateria();
        cm2.setMateria(m2);
        cm2.setPeso(2.0);
        cm2.setQuestoesProva(20); // Score 40 (Total 50 -> 20% e 80%)

        when(concursoMateriaRepository.findAllByConcursoId(concursoId))
                .thenReturn(List.of(cm1, cm2));

        // Act
        List<DadosSugestaoCiclo> sugestao = cicloService.sugerir(concursoId, horasMeta, questoesMeta, null);

        // Assert
        assertNotNull(sugestao);
        assertEquals(2, sugestao.size());

        // Validação da matemática (20% de 10h = 2h; 80% de 10h = 8h)
        // CORREÇÃO AQUI: nomeMateria() em vez de materiaNome()
        DadosSugestaoCiclo s1 = sugestao.stream().filter(s -> s.nomeMateria().equals("Portugues")).findFirst()
                .orElseThrow();
        DadosSugestaoCiclo s2 = sugestao.stream().filter(s -> s.nomeMateria().equals("Direito")).findFirst()
                .orElseThrow();

        assertEquals(2.0, s1.horasSugeridas());
        assertEquals(8.0, s2.horasSugeridas());

        // Validação da soma total (Não pode perder horas no arredondamento)
        double totalSugerido = sugestao.stream().mapToDouble(DadosSugestaoCiclo::horasSugeridas).sum();
        assertEquals(horasMeta, totalSugerido);
    }

    @Test
    @DisplayName("SUGERIR: Deve lançar erro se concurso não tiver matérias")
    void sugerir_deveLancarErroSemMaterias() {
        Long concursoId = 1L;
        when(concursoMateriaRepository.findAllByConcursoId(concursoId)).thenReturn(List.of());

        assertThrows(RuntimeException.class, () -> cicloService.sugerir(concursoId, 10.0, 50, null));
    }

    @Test
    @DisplayName("SUGERIR: Deve separar horas Gerais e Discursivas corretamente")
    void sugerir_deveSepararHorasGeraisEDiscursivas() {
        // Arrange
        Long concursoId = 1L;
        Double horasGerais = 8.0;
        Double horasDiscursiva = 2.0;

        Materia mGeral = new Materia();
        mGeral.setId(1L);
        mGeral.setNome("Portugues");
        mGeral.setTipo(TipoMateria.GERAL);

        Materia mDiscursiva = new Materia();
        mDiscursiva.setId(2L);
        mDiscursiva.setNome("Redação");
        mDiscursiva.setTipo(TipoMateria.DISCURSIVA);

        ConcursoMateria cm1 = new ConcursoMateria();
        cm1.setMateria(mGeral);
        cm1.setPeso(1.0);
        cm1.setQuestoesProva(10);

        ConcursoMateria cm2 = new ConcursoMateria();
        cm2.setMateria(mDiscursiva);
        cm2.setPeso(0.0); // Peso irrelevante para discursiva no cálculo novo
        cm2.setQuestoesProva(0);

        when(concursoMateriaRepository.findAllByConcursoId(concursoId))
                .thenReturn(List.of(cm1, cm2));

        // Act
        List<DadosSugestaoCiclo> sugestao = cicloService.sugerir(concursoId, horasGerais, 0, horasDiscursiva);

        // Assert
        assertEquals(2, sugestao.size());

        DadosSugestaoCiclo sGeral = sugestao.stream().filter(s -> s.nomeMateria().equals("Portugues")).findFirst()
                .orElseThrow();
        DadosSugestaoCiclo sDiscursiva = sugestao.stream().filter(s -> s.nomeMateria().equals("Redação")).findFirst()
                .orElseThrow();

        // Gerais: deve receber 100% das horasGerais (pois só tem ela)
        assertEquals(8.0, sGeral.horasSugeridas());

        // Discursiva: deve receber exatamente o valor fixo
        assertEquals(2.0, sDiscursiva.horasSugeridas());
    }

    // --- TESTES DE GERAÇÃO DE CICLO ---

    @Test
    @DisplayName("GERAR: Deve criar novo ciclo e fechar o anterior")
    void gerarCiclo_deveCriarNovoEFecharAnterior() {
        // Arrange
        Usuario usuario = new Usuario();
        usuario.setId(10L);

        Concurso concurso = new Concurso();
        concurso.setId(1L);
        concurso.setUsuario(usuario); // Dono correto

        Ciclo cicloAntigo = new Ciclo();
        cicloAntigo.setId(55L);
        cicloAntigo.setAtivo(true);
        cicloAntigo.setConcurso(concurso);

        DadosCriacaoCiclo.DadosItemCiclo itemDto = new DadosCriacaoCiclo.DadosItemCiclo(100L, 2.0, 10, 1);
        DadosCriacaoCiclo dados = new DadosCriacaoCiclo(1L, "Novo Ciclo", 20.0, 100, List.of(itemDto));

        Materia materia = new Materia();
        materia.setId(100L);

        when(concursoRepository.findById(1L)).thenReturn(Optional.of(concurso));
        when(cicloRepository.findFirstByUsuarioAndAtivoTrue(usuario)).thenReturn(Optional.of(cicloAntigo));
        when(materiaRepository.findById(100L)).thenReturn(Optional.of(materia));

        // Act
        cicloService.gerarCiclo(dados, usuario);

        // Assert
        // 1. Verifica se fechou o antigo
        assertFalse(cicloAntigo.getAtivo());
        assertNotNull(cicloAntigo.getDataFim());
        verify(cicloRepository).save(cicloAntigo);

        // 2. Verifica se salvou o novo
        verify(cicloRepository).save(argThat(cicloNovo -> cicloNovo.getAtivo() &&
                cicloNovo.getConcurso().equals(concurso) &&
                cicloNovo.getItens().size() == 1 &&
                cicloNovo.getItens().get(0).getMateria().getId().equals(100L)));
    }

    @Test
    @DisplayName("GERAR: Deve impedir criação para concurso de outro usuário")
    void gerarCiclo_deveImpedirAcessoIndevido() {
        Usuario usuarioLogado = new Usuario();
        usuarioLogado.setId(1L);
        Usuario donoConcurso = new Usuario();
        donoConcurso.setId(2L);

        Concurso concurso = new Concurso();
        concurso.setId(10L);
        concurso.setUsuario(donoConcurso);

        DadosCriacaoCiclo dados = new DadosCriacaoCiclo(10L, "Teste", 10.0, 10, new ArrayList<>());

        when(concursoRepository.findById(10L)).thenReturn(Optional.of(concurso));

        assertThrows(RuntimeException.class, () -> cicloService.gerarCiclo(dados, usuarioLogado));
    }

    // --- TESTES DE ENCERRAMENTO ---

    @Test
    @DisplayName("ENCERRAR: Deve encerrar ciclo ativo corretamente")
    void encerrar_deveFecharCicloAtivo() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        Concurso concurso = new Concurso();
        concurso.setUsuario(usuario);

        Ciclo ciclo = new Ciclo();
        ciclo.setId(99L);
        ciclo.setAtivo(true);
        ciclo.setConcurso(concurso);

        when(cicloRepository.findById(99L)).thenReturn(Optional.of(ciclo));

        cicloService.encerrar(99L, usuario);

        assertFalse(ciclo.getAtivo());
        assertNotNull(ciclo.getDataFim());
        verify(cicloRepository).save(ciclo);
    }

    @Test
    @DisplayName("ENCERRAR: Deve falhar se ciclo já estiver fechado")
    void encerrar_deveFalharSeJaFechado() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        Concurso concurso = new Concurso();
        concurso.setUsuario(usuario);

        Ciclo ciclo = new Ciclo();
        ciclo.setId(99L);
        ciclo.setAtivo(false); // Já fechado
        ciclo.setConcurso(concurso);

        when(cicloRepository.findById(99L)).thenReturn(Optional.of(ciclo));

        assertThrows(RuntimeException.class, () -> cicloService.encerrar(99L, usuario));
    }
}