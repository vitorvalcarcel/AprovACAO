package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosCadastroRegistro;
import com.nomeacao.api.dto.DadosDetalhamentoRegistro;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.service.RegistroEstudoService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/registros")
public class RegistroEstudoController {

    @Autowired
    private RegistroEstudoService service;

    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroRegistro dados,
                                    @AuthenticationPrincipal Usuario usuario,
                                    UriComponentsBuilder uriBuilder) {
        var dto = service.registrar(dados, usuario);
        var uri = uriBuilder.path("/registros/{id}").buildAndExpand(dto.id()).toUri();
        return ResponseEntity.created(uri).body(dto);
    }

    @GetMapping
    public ResponseEntity<List<DadosDetalhamentoRegistro>> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            @RequestParam(required = false) List<Long> materias,
            @RequestParam(required = false) List<Long> concursos,
            @RequestParam(required = false) List<Long> tipos,
            @AuthenticationPrincipal Usuario usuario) {
        
        var lista = service.listar(inicio, fim, materias, concursos, tipos, usuario);
        return ResponseEntity.ok(lista);
    }
}