package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosTipoEstudo;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.service.TipoEstudoService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/tipos-estudo")
public class TipoEstudoController {

    @Autowired private TipoEstudoService service;

    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosTipoEstudo dados, 
                                    @AuthenticationPrincipal Usuario usuario,
                                    UriComponentsBuilder uriBuilder) {
        var tipo = service.cadastrar(dados, usuario);
        var uri = uriBuilder.path("/tipos-estudo/{id}").buildAndExpand(tipo.getId()).toUri();
        return ResponseEntity.created(uri).body(new DadosTipoEstudo(tipo));
    }

    @GetMapping
    public ResponseEntity<List<DadosTipoEstudo>> listar(
            @RequestParam(required = false, defaultValue = "false") boolean incluirArquivados,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.listar(incluirArquivados, usuario));
    }

    @PutMapping
    @Transactional
    public ResponseEntity atualizar(@RequestBody @Valid DadosTipoEstudo dados, @AuthenticationPrincipal Usuario usuario) {
        service.atualizar(dados, usuario);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity excluir(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        try {
            service.excluir(id, usuario);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/alternar-arquivo")
    @Transactional
    public ResponseEntity alternarArquivo(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        service.alternarArquivamento(id, usuario);
        return ResponseEntity.noContent().build();
    }
}