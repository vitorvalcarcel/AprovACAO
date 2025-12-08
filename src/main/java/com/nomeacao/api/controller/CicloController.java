package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosCriacaoCiclo;
import com.nomeacao.api.dto.DadosSugestaoCiclo;
import com.nomeacao.api.dto.DashboardDTO;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.service.CicloService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/ciclos")
public class CicloController {

    @Autowired private CicloService service;

    @GetMapping("/sugestao")
    public ResponseEntity<DadosSugestaoCiclo> obterSugestao(
            @RequestParam Long concursoId,
            @RequestParam Double horas,
            @AuthenticationPrincipal Usuario usuario) {
        
        var sugestao = service.gerarSugestao(concursoId, horas, usuario);
        return ResponseEntity.ok(sugestao);
    }

    @PostMapping
    @Transactional
    public ResponseEntity criar(@RequestBody @Valid DadosCriacaoCiclo dados,
                                @AuthenticationPrincipal Usuario usuario,
                                UriComponentsBuilder uriBuilder) {
        
        var id = service.criarCiclo(dados, usuario);
        var uri = uriBuilder.path("/ciclos/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(uri).build(); // Retorna 201 Created
    }

    @GetMapping("/atual")
    public ResponseEntity<DashboardDTO> obterAtual(@RequestParam Long concursoId,
                                                   @AuthenticationPrincipal Usuario usuario) {
        var dash = service.calcularProgresso(concursoId, usuario);
        return ResponseEntity.ok(dash);
    }

    @PutMapping("/{id}/fechar")
    @Transactional
    public ResponseEntity fechar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        service.fecharCiclo(id, usuario);
        return ResponseEntity.noContent().build();
    }

}