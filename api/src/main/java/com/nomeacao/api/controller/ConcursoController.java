package com.nomeacao.api.controller;

import com.nomeacao.api.dto.*;
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
        return ResponseEntity.ok(service.listar(usuarioLogado));
    }

    @PutMapping
    @Transactional
    public ResponseEntity atualizar(@RequestBody @Valid DadosAtualizacaoConcurso dados,
                                    @AuthenticationPrincipal Usuario usuarioLogado) {
        try {
            return ResponseEntity.ok(service.atualizar(dados, usuarioLogado));
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

    @PatchMapping("/{id}/arquivar")
    @Transactional
    public ResponseEntity arquivar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        try {
            service.arquivar(id, usuario);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/desarquivar")
    @Transactional
    public ResponseEntity desarquivar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        service.desarquivar(id, usuario);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/materias")
    @Transactional
    public ResponseEntity vincularMateria(@PathVariable Long id,
                                          @RequestBody @Valid DadosVinculoMateria dados,
                                          @AuthenticationPrincipal Usuario usuarioLogado,
                                          UriComponentsBuilder uriBuilder) {
        try {
            var dto = vinculoService.vincular(id, dados, usuarioLogado);
            var uri = uriBuilder.path("/concursos/vinculos/{id}").buildAndExpand(dto.id()).toUri();
            return ResponseEntity.created(uri).body(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/materias")
    public ResponseEntity listarMaterias(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        try {
            return ResponseEntity.ok(vinculoService.listar(id, usuario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/materias")
    @Transactional
    public ResponseEntity atualizarVinculo(@RequestBody @Valid DadosAtualizacaoVinculo dados,
                                           @AuthenticationPrincipal Usuario usuarioLogado) {
        try {
            return ResponseEntity.ok(vinculoService.atualizar(dados, usuarioLogado));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/materias/{idVinculo}")
    @Transactional
    public ResponseEntity desvincularMateria(@PathVariable Long idVinculo, @AuthenticationPrincipal Usuario usuario) {
        try {
            vinculoService.desvincular(idVinculo, usuario);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}