package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosDetalhamentoFeedback;
import com.nomeacao.api.dto.DadosEnvioFeedback;
import com.nomeacao.api.model.Feedback;
import com.nomeacao.api.model.TipoFeedback;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.FeedbackRepository;
import com.nomeacao.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    // Limite de feedbacks por usuário a cada 24h
    private static final int LIMIT_DIARIO = 3;

    @Transactional
    public DadosDetalhamentoFeedback registrar(DadosEnvioFeedback dados, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // 1. Rate Limiting (Segurança)
        LocalDateTime ultimas24Horas = LocalDateTime.now().minusHours(24);
        long feedbacksRecentes = feedbackRepository.countByUsuarioAndDataEnvioAfter(usuario, ultimas24Horas);

        if (feedbacksRecentes >= LIMIT_DIARIO) {
            // Lançamos RuntimeException pois o seu TratadorDeErros a captura, 
            // retorna 400 e envia a mensagem para o Toast do front.
            throw new RuntimeException("Você atingiu o limite de " + LIMIT_DIARIO + " feedbacks por dia. Tente novamente amanhã.");
        }

        // 2. Persistência
        Feedback feedback = new Feedback(usuario, dados.tipo(), dados.mensagem());
        feedbackRepository.save(feedback);

        // 3. Notificação Inteligente (Economia de Cota)
        // Só dispara e-mail se for BUG.
        if (dados.tipo() == TipoFeedback.BUG) {
            emailService.enviarNotificacaoBug(usuario, dados.mensagem());
        }

        return new DadosDetalhamentoFeedback(feedback);
    }
}