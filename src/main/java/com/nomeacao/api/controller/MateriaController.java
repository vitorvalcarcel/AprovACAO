package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosAtualizacaoMateria;
import com.nomeacao.api.dto.DadosCadastroMateria;
import com.nomeacao.api.dto.DadosListagemMateria;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.service.MateriaService; // Importa o Service
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/materias")
public class MateriaController {

    @Autowired
    private MateriaService service;

    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroMateria dados, 
                                    @AuthenticationPrincipal Usuario usuarioLogado,
                                    UriComponentsBuilder uriBuilder) {
        
        var dto = service.cadastrar(dados, usuarioLogado);
        var uri = uriBuilder.path("/materias/{id}").buildAndExpand(dto.id()).toUri();
        
        return ResponseEntity.created(uri).body(dto);
    }

    @GetMapping
    public ResponseEntity<List<DadosListagemMateria>> listar(@AuthenticationPrincipal Usuario usuarioLogado) {
        var lista = service.listar(usuarioLogado);
        return ResponseEntity.ok(lista);
    }

    @PutMapping
    @Transactional
    public ResponseEntity atualizar(@RequestBody @Valid DadosAtualizacaoMateria dados, 
                                    @AuthenticationPrincipal Usuario usuarioLogado) {
        try {
            var dto = service.atualizar(dados, usuarioLogado);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage()); // Trata o erro de permissão
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
    public ResponseEntity arquivar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuarioLogado) {
        try {
            service.arquivar(id, usuarioLogado);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/desarquivar")
    @Transactional
    public ResponseEntity desarquivar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuarioLogado) {
        service.desarquivar(id, usuarioLogado);
        return ResponseEntity.noContent().build();
    }
}