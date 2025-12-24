package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosCriacaoCiclo;
import com.nomeacao.api.dto.DadosListagemCiclo;
import com.nomeacao.api.dto.DadosSugestaoCiclo;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.service.CicloService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ciclos")
public class CicloController {

    @Autowired
    private CicloService service;

    @PostMapping
    @Transactional
    public ResponseEntity criar(@RequestBody @Valid DadosCriacaoCiclo dados, @AuthenticationPrincipal Usuario usuario) {
        service.gerarCiclo(dados, usuario);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/sugestao")
    public ResponseEntity<List<DadosSugestaoCiclo>> obterSugestao(
            @RequestParam Long concursoId,
            @RequestParam Double horas,
            @RequestParam(required = false, defaultValue = "0") Integer questoes,
            @RequestParam(required = false) Double horasDiscursiva) {

        var sugestao = service.sugerir(concursoId, horas, questoes, horasDiscursiva);
        return ResponseEntity.ok(sugestao);
    }

    @GetMapping
    public ResponseEntity<List<DadosListagemCiclo>> listarHistorico(
            @RequestParam Long concursoId,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.listarHistorico(concursoId, usuario));
    }

    @PatchMapping("/{id}/encerrar")
    @Transactional
    public ResponseEntity encerrar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        try {
            service.encerrar(id, usuario);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity excluir(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        try {
            service.excluir(id, usuario);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }
    }
}