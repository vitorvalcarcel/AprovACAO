package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosCadastroRegistro;
import com.nomeacao.api.dto.DadosDetalhamentoRegistro;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.service.RegistroEstudoService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/registros")
public class RegistroEstudoController {

    @Autowired
    private RegistroEstudoService service;

    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroRegistro dados,
                                    @AuthenticationPrincipal Usuario usuario) {
        var dto = service.registrar(dados, usuario);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<DadosDetalhamentoRegistro>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.listarHistorico(usuario));
    }
}