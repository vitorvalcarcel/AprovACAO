package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosAutenticacao;
import com.nomeacao.api.infra.security.DadosTokenJWT;
import com.nomeacao.api.infra.security.TokenService;
import com.nomeacao.api.model.Usuario;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import com.nomeacao.api.dto.DadosRefreshToken;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AutenticacaoController {

    @Autowired
    private AuthenticationManager manager;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity efetuarLogin(@RequestBody @Valid DadosAutenticacao dados) {
        var authenticationToken = new UsernamePasswordAuthenticationToken(dados.email(), dados.senha());
        var authentication = manager.authenticate(authenticationToken);

        var usuario = (Usuario) authentication.getPrincipal();
        var accessToken = tokenService.gerarToken(usuario);
        var refreshToken = tokenService.gerarRefreshToken(usuario);

        return ResponseEntity.ok(new DadosTokenJWT(accessToken, refreshToken));
    }

    @PostMapping("/refresh")
    public ResponseEntity refreshToken(@RequestBody @Valid DadosRefreshToken dados) {
        var refreshTokenRecebido = dados.refreshToken();
        var refreshTokenModel = tokenService.validarRefreshToken(refreshTokenRecebido);

        // Rotação: Invalida o antigo
        tokenService.revogarRefreshToken(refreshTokenModel);

        // Gera novos
        var usuario = refreshTokenModel.getUsuario();
        var newAccessToken = tokenService.gerarToken(usuario);
        var newRefreshToken = tokenService.gerarRefreshToken(usuario);

        return ResponseEntity.ok(new DadosTokenJWT(newAccessToken, newRefreshToken));
    }
}