package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosAtualizacaoConcurso;
import com.nomeacao.api.dto.DadosAtualizacaoVinculo;
import com.nomeacao.api.dto.DadosDetalhamentoVinculo;
import com.nomeacao.api.dto.DadosVinculoMateria;
import com.nomeacao.api.dto.DadosCadastroConcurso;
import com.nomeacao.api.dto.DadosListagemConcurso;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.service.ConcursoService;
import com.nomeacao.api.service.ConcursoMateriaService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/concursos")
public class ConcursoController {

    @Autowired
    private ConcursoService service;

    @Autowired
    private ConcursoMateriaService vinculoService;

    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroConcurso dados,
                                    @AuthenticationPrincipal Usuario usuarioLogado,
                                    UriComponentsBuilder uriBuilder) {
        var dto = service.cadastrar(dados, usuarioLogado);
        var uri = uriBuilder.path("/concursos/{id}").buildAndExpand(dto.id()).toUri();
        return ResponseEntity.created(uri).body(dto);
    }

    @GetMapping
    public ResponseEntity<List<DadosListagemConcurso>> listar(@AuthenticationPrincipal Usuario usuarioLogado) {
        var lista = service.listar(usuarioLogado);
        return ResponseEntity.ok(lista);
    }

    @PutMapping
    @Transactional
    public ResponseEntity atualizar(@RequestBody @Valid DadosAtualizacaoConcurso dados,
                                    @AuthenticationPrincipal Usuario usuarioLogado) {
        try {
            var dto = service.atualizar(dados, usuarioLogado);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity excluir(@PathVariable Long id, @AuthenticationPrincipal Usuario usuarioLogado) {
        try {
            service.excluir(id, usuarioLogado);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @PostMapping("/{id}/materias")
    @Transactional
    public ResponseEntity vincularMateria(@PathVariable Long id,
                                          @RequestBody @Valid DadosVinculoMateria dados,
                                          @AuthenticationPrincipal Usuario usuarioLogado,
                                          UriComponentsBuilder uriBuilder) {
        
        var dto = vinculoService.vincular(id, dados, usuarioLogado);
        
        var uri = uriBuilder.path("/concursos/vinculos/{id}").buildAndExpand(dto.id()).toUri();
        
        return ResponseEntity.created(uri).body(dto);
    }

    @PutMapping("/materias")
    @Transactional
    public ResponseEntity atualizarVinculo(@RequestBody @Valid DadosAtualizacaoVinculo dados,
                                           @AuthenticationPrincipal Usuario usuarioLogado) {
        try {
            var dto = vinculoService.atualizar(dados, usuarioLogado);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
}