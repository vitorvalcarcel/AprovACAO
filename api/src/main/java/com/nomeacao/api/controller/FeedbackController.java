package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosEnvioFeedback;
import com.nomeacao.api.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/feedbacks")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<Void> enviar(@RequestBody @Valid DadosEnvioFeedback dados, Authentication authentication) {
        feedbackService.registrar(dados, authentication.getName());
        return ResponseEntity.ok().build();
    }
}