package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosCadastroRegistro;
import com.nomeacao.api.dto.DadosDetalhamentoRegistro;
import com.nomeacao.api.dto.DadosAtualizacaoRegistro;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.service.RegistroEstudoService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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

    @PutMapping
    @Transactional
    public ResponseEntity atualizar(@RequestBody @Valid DadosAtualizacaoRegistro dados,
                                    @AuthenticationPrincipal Usuario usuario) {
        var dto = service.atualizar(dados, usuario);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<Page<DadosDetalhamentoRegistro>> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            @RequestParam(required = false) List<Long> materias,
            @RequestParam(required = false) List<Long> topicos, // Parâmetro adicionado
            @RequestParam(required = false) List<Long> concursos,
            @RequestParam(required = false) List<Long> tipos,
            @PageableDefault(size = 20, sort = "dataInicio", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal Usuario usuario) {
        
        var pagina = service.listar(inicio, fim, materias, topicos, concursos, tipos, pageable, usuario);
        return ResponseEntity.ok(pagina);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity excluir(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        try {
            service.excluir(id, usuario);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity excluirEmLote(@RequestParam List<Long> ids, @AuthenticationPrincipal Usuario usuario) {
        try {
            service.excluirEmLote(ids, usuario);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
}