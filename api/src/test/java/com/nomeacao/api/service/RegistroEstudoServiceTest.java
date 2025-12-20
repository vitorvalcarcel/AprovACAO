package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosAtualizacaoRegistro;
import com.nomeacao.api.dto.DadosCadastroRegistro;
import com.nomeacao.api.dto.DadosDetalhamentoRegistro;
import com.nomeacao.api.model.*;
import com.nomeacao.api.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistroEstudoServiceTest {

    @InjectMocks
    private RegistroEstudoService service;

    @Mock
    private RegistroEstudoRepository repository;

    @Mock
    private MateriaRepository materiaRepository;

    @Mock
    private TopicoRepository topicoRepository;

    @Mock
    private ConcursoRepository concursoRepository;

    @Mock
    private TipoEstudoRepository tipoRepository;

    @Mock
    private CicloRepository cicloRepository;

    // --- TESTES DE CRIAÇÃO (REGISTRAR) ---

    @Test
    @DisplayName("REGISTRAR: Deve vincular Concurso automaticamente via Ciclo Ativo (Cenário Padrão)")
    void registrar_comCicloAutomatico() {
        // Arrange
        Usuario usuario = new Usuario(); usuario.setId(1L);
        
        Materia materia = new Materia(); 
        materia.setId(10L); 
        materia.setNome("Matéria Teste");
        materia.setUsuario(usuario);

        Concurso concursoDoCiclo = new Concurso(); 
        concursoDoCiclo.setId(50L);
        concursoDoCiclo.setNome("Concurso Teste");

        Ciclo cicloAtivo = new Ciclo();
        cicloAtivo.setAtivo(true);
        cicloAtivo.setConcurso(concursoDoCiclo);

        // DTO sem Concurso ID (simulando front-end)
        DadosCadastroRegistro dados = new DadosCadastroRegistro(
            10L, null, null, null, 
            LocalDateTime.now(), 3600, 10, 8, true, "Estudo focado"
        );

        when(materiaRepository.findById(10L)).thenReturn(Optional.of(materia));
        // O pulo do gato: Mockar a busca pelo ciclo ativo
        when(cicloRepository.findFirstByUsuarioAndAtivoTrue(usuario)).thenReturn(Optional.of(cicloAtivo));

        // Act
        service.registrar(dados, usuario);

        // Assert
        verify(repository).save(argThat(registro -> 
            registro.getConcurso() != null &&
            registro.getConcurso().getId().equals(50L) && // Garante que pegou do ciclo
            registro.getMateria().getId().equals(10L) &&
            registro.getSegundos() == 3600
        ));
    }

    @Test
    @DisplayName("REGISTRAR: Deve falhar ao tentar usar Matéria de outro usuário (Segurança)")
    void registrar_acessoNegadoMateria() {
        Usuario usuarioLogado = new Usuario(); usuarioLogado.setId(1L);
        Usuario donoMateria = new Usuario(); donoMateria.setId(2L);

        Materia materia = new Materia();
        materia.setId(10L);
        materia.setUsuario(donoMateria); // Dono diferente

        DadosCadastroRegistro dados = new DadosCadastroRegistro(
            10L, null, null, null, 
            LocalDateTime.now(), 60, 0, 0, true, null
        );

        when(materiaRepository.findById(10L)).thenReturn(Optional.of(materia));

        assertThrows(RuntimeException.class, () -> service.registrar(dados, usuarioLogado));
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("REGISTRAR: Deve salvar com todos os campos preenchidos manualmente")
    void registrar_comDadosCompletos() {
        Usuario usuario = new Usuario(); usuario.setId(1L);
        
        Materia materia = new Materia(); materia.setId(10L); materia.setUsuario(usuario); materia.setNome("Matéria");
        Concurso concurso = new Concurso(); concurso.setId(20L); concurso.setUsuario(usuario); concurso.setNome("Concurso");
        Topico topico = new Topico(); topico.setId(30L); topico.setNome("Tópico");
        TipoEstudo tipo = new TipoEstudo(); tipo.setId(40L); tipo.setUsuario(usuario);

        DadosCadastroRegistro dados = new DadosCadastroRegistro(
            10L, 30L, 20L, 40L, 
            LocalDateTime.now(), 1200, 5, 5, true, "Revisão"
        );

        when(materiaRepository.findById(10L)).thenReturn(Optional.of(materia));
        when(concursoRepository.findById(20L)).thenReturn(Optional.of(concurso));
        when(topicoRepository.findById(30L)).thenReturn(Optional.of(topico));
        when(tipoRepository.findById(40L)).thenReturn(Optional.of(tipo));

        DadosDetalhamentoRegistro resultado = service.registrar(dados, usuario);

        assertNotNull(resultado);
        verify(repository).save(argThat(r -> 
            r.getConcurso().getId().equals(20L) &&
            r.getTopico().getId().equals(30L) &&
            r.getTipoEstudo().getId().equals(40L)
        ));
    }

    // --- TESTES DE ATUALIZAÇÃO ---

    @Test
    @DisplayName("ATUALIZAR: Deve atualizar apenas campos permitidos")
    void atualizar_camposPermitidos() {
        Usuario usuario = new Usuario(); usuario.setId(1L);
        
        Materia materia = new Materia();
        materia.setId(10L);
        materia.setNome("Matéria Teste"); // Necessário para não dar NPE no DTO

        RegistroEstudo registroAntigo = new RegistroEstudo();
        registroAntigo.setId(100L);
        registroAntigo.setUsuario(usuario);
        registroAntigo.setMateria(materia); // Correção aqui!
        registroAntigo.setSegundos(100);
        registroAntigo.setAnotacoes("Antiga");

        // DTO atualizando segundos e anotações
        DadosAtualizacaoRegistro dados = new DadosAtualizacaoRegistro(
            100L, null, 500, null, null, "Nova Anotação", null, null, null, null
        );

        when(repository.findById(100L)).thenReturn(Optional.of(registroAntigo));

        service.atualizar(dados, usuario);

        verify(repository).save(argThat(r -> 
            r.getSegundos() == 500 && // Atualizou
            r.getAnotacoes().equals("Nova Anotação") // Atualizou
        ));
    }

    @Test
    @DisplayName("ATUALIZAR: Deve impedir edição de registro de outro usuário")
    void atualizar_acessoNegado() {
        Usuario usuarioLogado = new Usuario(); usuarioLogado.setId(1L);
        Usuario donoRegistro = new Usuario(); donoRegistro.setId(99L);

        RegistroEstudo registro = new RegistroEstudo();
        registro.setId(100L);
        registro.setUsuario(donoRegistro);

        DadosAtualizacaoRegistro dados = new DadosAtualizacaoRegistro(
            100L, null, 200, null, null, null, null, null, null, null
        );

        when(repository.findById(100L)).thenReturn(Optional.of(registro));

        assertThrows(RuntimeException.class, () -> service.atualizar(dados, usuarioLogado));
    }

    // --- TESTES DE EXCLUSÃO ---

    @Test
    @DisplayName("EXCLUIR: Deve deletar registro próprio")
    void excluir_sucesso() {
        Usuario usuario = new Usuario(); usuario.setId(1L);
        RegistroEstudo registro = new RegistroEstudo();
        registro.setUsuario(usuario);

        when(repository.findById(10L)).thenReturn(Optional.of(registro));

        service.excluir(10L, usuario);

        verify(repository).delete(registro);
    }
}