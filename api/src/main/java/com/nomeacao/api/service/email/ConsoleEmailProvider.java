package com.nomeacao.api.service.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ConsoleEmailProvider implements EmailSenderProvider {

    private static final Logger logger = LoggerFactory.getLogger(ConsoleEmailProvider.class);

    @Override
    public void enviar(String para, String assunto, String conteudo) {
        logger.warn("=========================================================================================");
        logger.warn("                   AMBIENTE DE DESENVOLVIMENTO - SIMULAÇÃO DE ENVIO DE E-MAIL            ");
        logger.warn("=========================================================================================");
        logger.info("PARA: {}", para);
        logger.info("ASSUNTO: {}", assunto);
        logger.info("CONTEÚDO (HTML): \n{}", conteudo);

        // Tentar extrair link se existir para facilitar
        if (conteudo.contains("href=\"")) {
            String link = conteudo.substring(conteudo.indexOf("href=\"") + 6);
            link = link.substring(0, link.indexOf("\""));
            logger.warn(">>> LINK DE AÇÃO RECONHECIDO: {}", link);
        }

        logger.warn("=========================================================================================");
    }
}
