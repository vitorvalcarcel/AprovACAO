package com.nomeacao.api.config;

import com.nomeacao.api.service.email.ConsoleEmailProvider;
import com.nomeacao.api.service.email.EmailSenderProvider;
import com.nomeacao.api.service.email.ResendEmailProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EmailConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(EmailConfiguration.class);

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from}")
    private String resendFrom;

    @Bean
    public EmailSenderProvider emailSenderProvider() {
        // Verifica se a chave é a padrão (placeholder) ou está vazia
        if (resendApiKey == null || resendApiKey.isBlank() || resendApiKey.equals("re_12345678")) {
            logger.info("Utilizando PROVIDER DE EMAIL DE DESENVOLVIMENTO (Console). Chave detectada: {}", resendApiKey);
            return new ConsoleEmailProvider();
        } else {
            logger.info("Utilizando PROVIDER DE EMAIL DE PRODUÇÃO (Resend).");
            return new ResendEmailProvider(resendApiKey, resendFrom);
        }
    }
}
