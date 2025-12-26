package com.nomeacao.api.service.email;

public interface EmailSenderProvider {
    void enviar(String para, String assunto, String conteudo);
}
