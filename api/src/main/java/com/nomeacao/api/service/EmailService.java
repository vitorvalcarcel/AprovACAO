package com.nomeacao.api.service;

import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.service.email.EmailSenderProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final EmailSenderProvider emailSenderProvider;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Autowired
    public EmailService(EmailSenderProvider emailSenderProvider) {
        this.emailSenderProvider = emailSenderProvider;
    }

    @Async
    public void enviarConfirmacao(String destinatario, String nome, String token) {
        String assunto = "Confirme seu cadastro no AprovAÇÃO";
        String link = frontendUrl + "/confirmar?token=" + token;

        String conteudo = String.format(
                """
                        <p>Olá, <strong>%s</strong>!</p>
                        <p>Seja bem-vindo(a) à plataforma que vai acelerar sua aprovação.</p>
                        <p>Para ativar sua conta e liberar seu acesso, clique no botão abaixo:</p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" class="button">Confirmar Meu E-mail</a>
                        </div>

                        <p style="font-size: 14px; color: #666;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
                        <p style="font-size: 12px; word-break: break-all; color: #2563EB;">%s</p>
                        """,
                nome, link, link);

        emailSenderProvider.enviar(destinatario, assunto, conteudo);
    }

    @Async
    public void enviarRecuperacaoSenha(String destinatario, String token) {
        String assunto = "Recuperação de Senha - AprovAÇÃO";
        String link = frontendUrl + "/redefinir-senha?token=" + token;

        String conteudo = String.format(
                """
                        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
                        <p>Se foi você, clique no botão abaixo para criar uma nova senha:</p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" class="button">Redefinir Minha Senha</a>
                        </div>

                        <p style="font-size: 14px; color: #666;">Este link é válido por 1 hora.</p>
                        <p style="font-size: 12px; color: #999;">Se não foi você, ignore este e-mail. Sua senha permanecerá a mesma.</p>
                        """,
                link);

        emailSenderProvider.enviar(destinatario, assunto, conteudo);
    }

    @Async
    public void enviarNotificacaoBug(Usuario autor, String mensagemBug) {
        if (adminEmail == null || adminEmail.isBlank() || adminEmail.contains("SEU_EMAIL")) {
            logger.warn("Admin email não configurado. Bug registrado apenas no banco.");
            return;
        }

        String assunto = "[BUG] AprovAÇÃO - " + autor.getNome();
        String conteudo = String.format("""
                <p><strong>Novo bug reportado!</strong></p>
                <p><strong>Usuário:</strong> %s (%s)</p>
                <p><strong>ID:</strong> %d</p>
                <hr/>
                <p><strong>Mensagem:</strong></p>
                <pre style="background: #f4f4f5; padding: 10px; border-radius: 5px;">%s</pre>
                """, autor.getNome(), autor.getEmail(), autor.getId(), mensagemBug);

        emailSenderProvider.enviar(adminEmail, assunto, conteudo);
    }
}
