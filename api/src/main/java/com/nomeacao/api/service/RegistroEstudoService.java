package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosCadastroRegistro;
import com.nomeacao.api.dto.DadosDetalhamentoRegistro;
import com.nomeacao.api.model.RegistroEstudo;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RegistroEstudoService {

    @Autowired private RegistroEstudoRepository repository;
    @Autowired private MateriaRepository materiaRepository;
    @Autowired private TopicoRepository topicoRepository;
    @Autowired private ConcursoRepository concursoRepository;
    @Autowired private TipoEstudoRepository tipoRepository;
    @Autowired private CicloRepository cicloRepository;

    public DadosDetalhamentoRegistro registrar(DadosCadastroRegistro dados, Usuario usuario) {
        var registro = new RegistroEstudo();
        registro.setUsuario(usuario);
        registro.setDataInicio(dados.dataInicio());
        registro.setSegundos(dados.segundos());
        registro.setQuestoesFeitas(dados.questoesFeitas());
        registro.setQuestoesCertas(dados.questoesCertas());
        registro.setAnotacoes(dados.anotacoes());
        
        registro.setContarHorasNoCiclo(dados.contarHorasNoCiclo() != null ? dados.contarHorasNoCiclo() : true);

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
        } else {
            cicloRepository.findFirstByUsuarioAndAtivoTrue(usuario)
                .ifPresent(cicloAtivo -> registro.setConcurso(cicloAtivo.getConcurso()));
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

    public List<DadosDetalhamentoRegistro> listar(
            LocalDateTime inicio, 
            LocalDateTime fim, 
            List<Long> materias, 
            List<Long> concursos, 
            List<Long> tipos, 
            Usuario usuario) {
        
        Specification<RegistroEstudo> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("usuario"), usuario));

            if (inicio != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dataInicio"), inicio));
            }
            if (fim != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dataInicio"), fim));
            }
            if (materias != null && !materias.isEmpty()) {
                predicates.add(root.get("materia").get("id").in(materias));
            }
            if (concursos != null && !concursos.isEmpty()) {
                predicates.add(root.get("concurso").get("id").in(concursos));
            }
            if (tipos != null && !tipos.isEmpty()) {
                predicates.add(root.get("tipoEstudo").get("id").in(tipos));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "dataInicio"))
                .stream()
                .map(DadosDetalhamentoRegistro::new)
                .toList();
    }

    @Transactional
    public void excluir(Long id, Usuario usuario) {
        var registro = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro não encontrado"));

        if (!registro.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado.");
        }

        repository.delete(registro);
    }

    @Transactional
    public void excluirEmLote(List<Long> ids, Usuario usuario) {
        if (ids == null || ids.isEmpty()) return;

        var registros = repository.findAllById(ids);
        
        // Verifica se todos os registros encontrados pertencem ao usuário
        boolean todosPertencemAoUsuario = registros.stream()
                .allMatch(r -> r.getUsuario().getId().equals(usuario.getId()));

        if (!todosPertencemAoUsuario) {
            throw new RuntimeException("Acesso negado: Um ou mais registros não pertencem a você.");
        }

        repository.deleteAll(registros);
    }
}