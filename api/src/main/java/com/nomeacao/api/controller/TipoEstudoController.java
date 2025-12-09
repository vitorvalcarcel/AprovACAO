package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosTipoEstudo;
import com.nomeacao.api.model.TipoEstudo;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.TipoEstudoRepository;
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

    @Autowired
    private TipoEstudoRepository repository;

    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosTipoEstudo dados, 
                                    @AuthenticationPrincipal Usuario usuario,
                                    UriComponentsBuilder uriBuilder) {
        var tipo = new TipoEstudo();
        tipo.setNome(dados.nome());
        tipo.setUsuario(usuario);
        repository.save(tipo);
        
        var uri = uriBuilder.path("/tipos-estudo/{id}").buildAndExpand(tipo.getId()).toUri();
        return ResponseEntity.created(uri).body(new DadosTipoEstudo(tipo));
    }

    @GetMapping
    public ResponseEntity<List<DadosTipoEstudo>> listar(@AuthenticationPrincipal Usuario usuario) {
        var lista = repository.findAllByUsuario(usuario).stream().map(DadosTipoEstudo::new).toList();
        return ResponseEntity.ok(lista);
    }
    
    // Adicionar DELETE e PUT depois.
}