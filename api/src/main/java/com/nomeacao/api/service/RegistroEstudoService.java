package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosCadastroRegistro;
import com.nomeacao.api.dto.DadosDetalhamentoRegistro;
import com.nomeacao.api.dto.DadosAtualizacaoRegistro;
import com.nomeacao.api.model.RegistroEstudo;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.*;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

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
        registro.setDataInicio(dados.dataInicio().withNano(0));        
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

    @Transactional
    public DadosDetalhamentoRegistro atualizar(DadosAtualizacaoRegistro dados, Usuario usuario) {
        var registro = repository.findById(dados.id())
                .orElseThrow(() -> new RuntimeException("Registro não encontrado"));

        if (!registro.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado.");
        }

        if (dados.dataInicio() != null) registro.setDataInicio(dados.dataInicio().withNano(0));
        
        if (dados.segundos() != null) registro.setSegundos(dados.segundos());
        if (dados.questoesFeitas() != null) registro.setQuestoesFeitas(dados.questoesFeitas());
        if (dados.questoesCertas() != null) registro.setQuestoesCertas(dados.questoesCertas());
        if (dados.anotacoes() != null) registro.setAnotacoes(dados.anotacoes());
        if (dados.contarHorasNoCiclo() != null) registro.setContarHorasNoCiclo(dados.contarHorasNoCiclo());

        if (dados.materiaId() != null) {
            var materia = materiaRepository.findById(dados.materiaId())
                    .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));
            if (!materia.getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso Negado à Matéria");
            registro.setMateria(materia);
        }

        if (dados.topicoId() != null) {
            var topico = topicoRepository.findById(dados.topicoId())
                    .orElseThrow(() -> new RuntimeException("Tópico não encontrado"));
            registro.setTopico(topico);
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

    public Page<DadosDetalhamentoRegistro> listar(
            LocalDateTime inicio, 
            LocalDateTime fim, 
            List<Long> materias, 
            List<Long> topicos, // Parâmetro adicionado
            List<Long> concursos, 
            List<Long> tipos, 
            Pageable pageable,
            Usuario usuario) {
        
        Specification<RegistroEstudo> spec = (root, query, cb) -> {
            List<Predicate> mainPredicates = new ArrayList<>();

            mainPredicates.add(cb.equal(root.get("usuario"), usuario));

            if (inicio != null) {
                mainPredicates.add(cb.greaterThanOrEqualTo(root.get("dataInicio"), inicio));
            }
            if (fim != null) {
                mainPredicates.add(cb.lessThanOrEqualTo(root.get("dataInicio"), fim));
            }

            // Lógica OR: (Materia IN ... OR Topico IN ...)
            List<Predicate> matTopPredicates = new ArrayList<>();
            if (materias != null && !materias.isEmpty()) {
                matTopPredicates.add(root.get("materia").get("id").in(materias));
            }
            if (topicos != null && !topicos.isEmpty()) {
                matTopPredicates.add(root.get("topico").get("id").in(topicos));
            }
            
            // Se tiver filtro de matéria ou tópico, agrupa com OR e adiciona ao AND principal
            if (!matTopPredicates.isEmpty()) {
                mainPredicates.add(cb.or(matTopPredicates.toArray(new Predicate[0])));
            }

            if (concursos != null && !concursos.isEmpty()) {
                mainPredicates.add(root.get("concurso").get("id").in(concursos));
            }
            if (tipos != null && !tipos.isEmpty()) {
                mainPredicates.add(root.get("tipoEstudo").get("id").in(tipos));
            }

            return cb.and(mainPredicates.toArray(new Predicate[0]));
        };

        return repository.findAll(spec, pageable)
                .map(DadosDetalhamentoRegistro::new);
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
        
        boolean todosPertencemAoUsuario = registros.stream()
                .allMatch(r -> r.getUsuario().getId().equals(usuario.getId()));

        if (!todosPertencemAoUsuario) {
            throw new RuntimeException("Acesso negado: Um ou mais registros não pertencem a você.");
        }

        repository.deleteAll(registros);
    }
}