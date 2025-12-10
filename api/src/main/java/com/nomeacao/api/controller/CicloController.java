package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosCriacaoCiclo;
import com.nomeacao.api.dto.DadosSugestaoCiclo;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.service.CicloService;
import jakarta.transaction.Transactional;
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

    @GetMapping("/sugestao")
    public ResponseEntity<List<DadosSugestaoCiclo>> sugerir(
            @RequestParam Long concursoId,
            @RequestParam Double horas,
            @AuthenticationPrincipal Usuario usuario) {
        
        return ResponseEntity.ok(service.sugerirCiclo(concursoId, horas, usuario));
    }

    @PostMapping
    @Transactional
    public ResponseEntity criar(@RequestBody DadosCriacaoCiclo dados, 
                                @AuthenticationPrincipal Usuario usuario) {
        service.criarCiclo(dados, usuario);
        return ResponseEntity.ok().build();
    }
}