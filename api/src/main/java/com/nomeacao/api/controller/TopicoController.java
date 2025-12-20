package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosAtualizacaoTopico;
import com.nomeacao.api.dto.DadosCadastroTopico;
import com.nomeacao.api.dto.MateriaComTopicosDTO;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.service.TopicoService;
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
    private TopicoService service;

    @GetMapping("/hierarquia")
    public ResponseEntity<List<MateriaComTopicosDTO>> listarHierarquia(@AuthenticationPrincipal Usuario usuario) {
        var hierarquia = service.listarHierarquia(usuario);
        return ResponseEntity.ok(hierarquia);
    }

    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroTopico dados,
                                    @AuthenticationPrincipal Usuario usuarioLogado,
                                    UriComponentsBuilder uriBuilder) {
        try {
            var dto = service.cadastrar(dados, usuarioLogado);
            var uri = uriBuilder.path("/topicos/{id}").buildAndExpand(dto.id()).toUri();
            return ResponseEntity.created(uri).body(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @GetMapping("/{materiaId}")
    public ResponseEntity listarPorMateria(@PathVariable Long materiaId,
                                           @RequestParam(required = false, defaultValue = "false") boolean incluirArquivados,
                                           @AuthenticationPrincipal Usuario usuarioLogado) {
        try {
            var lista = service.listar(materiaId, incluirArquivados, usuarioLogado);
            return ResponseEntity.ok(lista);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @PutMapping
    @Transactional
    public ResponseEntity atualizar(@RequestBody @Valid DadosAtualizacaoTopico dados, 
                                    @AuthenticationPrincipal Usuario usuarioLogado) {
        try {
            var dto = service.atualizar(dados, usuarioLogado);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
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
        service.arquivar(id, usuario);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/desarquivar")
    @Transactional
    public ResponseEntity desarquivar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        service.desarquivar(id, usuario);
        return ResponseEntity.noContent().build();
    }
}