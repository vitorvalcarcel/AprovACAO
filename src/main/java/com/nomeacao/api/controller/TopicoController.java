package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosCadastroTopico;
import com.nomeacao.api.dto.DadosListagemTopico;
import com.nomeacao.api.model.Topico;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.MateriaRepository;
import com.nomeacao.api.repository.TopicoRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/topicos")
public class TopicoController {

    @Autowired
    private TopicoRepository repository;

    @Autowired
    private MateriaRepository materiaRepository;

    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroTopico dados,
                                    @AuthenticationPrincipal Usuario usuarioLogado,
                                    UriComponentsBuilder uriBuilder) {
        
        var materiaPai = materiaRepository.findById(dados.materiaId())
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        if (!materiaPai.getUsuario().getId().equals(usuarioLogado.getId())) {
            return ResponseEntity.status(403).build(); // Proibido!
        }

        var topico = new Topico();
        topico.setNome(dados.nome());
        topico.setMateria(materiaPai);

        repository.save(topico);

        var uri = uriBuilder.path("/topicos/{id}").buildAndExpand(topico.getId()).toUri();
        return ResponseEntity.created(uri).body(new DadosListagemTopico(topico));
    }

    @GetMapping("/{materiaId}")
    public ResponseEntity<List<DadosListagemTopico>> listarPorMateria(@PathVariable Long materiaId, 
                                                                      @AuthenticationPrincipal Usuario usuarioLogado) {
        var materiaPai = materiaRepository.findById(materiaId)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        if (!materiaPai.getUsuario().getId().equals(usuarioLogado.getId())) {
            return ResponseEntity.status(403).build();
        }

        var lista = repository.findAllByMateriaId(materiaId)
                .stream()
                .map(DadosListagemTopico::new)
                .toList();

        return ResponseEntity.ok(lista);
    }
}