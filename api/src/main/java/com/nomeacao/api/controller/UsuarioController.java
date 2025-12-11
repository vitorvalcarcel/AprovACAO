package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosCadastroUsuario;
import com.nomeacao.api.service.AutenticacaoService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private AutenticacaoService autenticacaoService;

    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroUsuario dados, UriComponentsBuilder uriBuilder) {
        autenticacaoService.cadastrar(dados);
        
        return ResponseEntity.ok().build(); 
    }
}