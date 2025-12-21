package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DashboardDTO;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService service;

    @GetMapping
    public ResponseEntity<DashboardDTO> carregar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            @RequestParam(required = false) List<Long> materias,
            @RequestParam(required = false) List<Long> topicos,
            @RequestParam(required = false) List<Long> concursos,
            @RequestParam(required = false) List<Long> tipos,
            @AuthenticationPrincipal Usuario usuario) {
        
        var dto = service.carregarDashboard(usuario, inicio, fim, materias, topicos, concursos, tipos);
        return ResponseEntity.ok(dto);
    }
}