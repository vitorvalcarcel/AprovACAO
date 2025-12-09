package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosCadastroRegistro;
import com.nomeacao.api.dto.DadosDetalhamentoRegistro;
import com.nomeacao.api.model.RegistroEstudo;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistroEstudoService {

    @Autowired private RegistroEstudoRepository repository;
    @Autowired private MateriaRepository materiaRepository;
    @Autowired private TopicoRepository topicoRepository;
    @Autowired private ConcursoRepository concursoRepository;
    @Autowired private TipoEstudoRepository tipoRepository;

    public DadosDetalhamentoRegistro registrar(DadosCadastroRegistro dados, Usuario usuario) {
        var registro = new RegistroEstudo();
        registro.setUsuario(usuario);
        registro.setDataInicio(dados.dataInicio());
        registro.setMinutos(dados.minutos());
        registro.setQuestoesFeitas(dados.questoesFeitas());
        registro.setQuestoesCertas(dados.questoesCertas());
        registro.setAnotacoes(dados.anotacoes());

        var materia = materiaRepository.findById(dados.materiaId())
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));
        if (!materia.getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso Negado à Matéria");
        registro.setMateria(materia);

        if (dados.topicoId() != null) {
            var topico = topicoRepository.findById(dados.topicoId())
                    .orElseThrow(() -> new RuntimeException("Tópico não encontrado"));
            registro.setTopico(topico);
        }

        if (dados.concursoId() != null) {
            var concurso = concursoRepository.findById(dados.concursoId())
                    .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));
            if (!concurso.getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso Negado ao Concurso");
            registro.setConcurso(concurso);
        }

        if (dados.tipoEstudoId() != null) {
            var tipo = tipoRepository.findById(dados.tipoEstudoId())
                    .orElseThrow(() -> new RuntimeException("Tipo de Estudo não encontrado"));
            if (!tipo.getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso Negado ao Tipo");
            registro.setTipoEstudo(tipo);
        }

        repository.save(registro);
        return new DadosDetalhamentoRegistro(registro);
    }

    public List<DadosDetalhamentoRegistro> listarHistorico(Usuario usuario) {
        return repository.findAllByUsuarioOrderByDataInicioDesc(usuario)
                .stream().map(DadosDetalhamentoRegistro::new).toList();
    }
}