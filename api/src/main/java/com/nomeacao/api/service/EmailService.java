package com.nomeacao.api.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remetente;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void enviarConfirmacao(String destinatario, String nome, String token) {
        String assunto = "Confirme seu cadastro no AprovAÇÃO";
        String link = frontendUrl + "/confirmar?token=" + token;
        
        String conteudo = String.format("""
            <p>Olá, <strong>%s</strong>!</p>
            <p>Seja bem-vindo(a) à plataforma que vai acelerar sua aprovação.</p>
            <p>Para ativar sua conta e liberar seu acesso, clique no botão abaixo:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="%s" class="button">Confirmar Meu E-mail</a>
            </div>
            
            <p style="font-size: 14px; color: #666;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
            <p style="font-size: 12px; word-break: break-all; color: #2563EB;">%s</p>
            """, nome, link, link);

        enviarEmailComTemplate(destinatario, assunto, conteudo);
    }

    @Async
    public void enviarRecuperacaoSenha(String destinatario, String token) {
        String assunto = "Recuperação de Senha - AprovAÇÃO";
        String link = frontendUrl + "/redefinir-senha?token=" + token;

        String conteudo = String.format("""
            <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
            <p>Se foi você, clique no botão abaixo para criar uma nova senha:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="%s" class="button">Redefinir Minha Senha</a>
            </div>
            
            <p style="font-size: 14px; color: #666;">Este link é válido por 1 hora.</p>
            <p style="font-size: 12px; color: #999;">Se não foi você, ignore este e-mail. Sua senha permanecerá a mesma.</p>
            """, link);

        enviarEmailComTemplate(destinatario, assunto, conteudo);
    }

    // Método auxiliar que injeta o HTML bonito ao redor do conteúdo
    private void enviarEmailComTemplate(String para, String assunto, String conteudoPrincipal) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(remetente);
            helper.setTo(para);
            helper.setSubject(assunto);

            // Template HTML Base (Design System)
            String htmlFinal = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
                        .container { max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
                        .header { background-color: #2563EB; padding: 30px; text-align: center; }
                        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
                        .content { padding: 40px 30px; color: #374151; line-height: 1.6; font-size: 16px; }
                        .button { display: inline-block; background-color: #2563EB; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3); transition: background-color 0.3s; }
                        .button:hover { background-color: #1d4ed8; }
                        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #f3f4f6; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>AprovAÇÃO 🎯</h1>
                        </div>
                        <div class="content">
                            %s
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 AprovAÇÃO. Sua estratégia, sua vaga.</p>
                            <p>Este é um e-mail automático, por favor não responda.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, conteudoPrincipal);

            helper.setText(htmlFinal, true); // true = ativa HTML

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erro ao enviar e-mail: " + e.getMessage());
        }
    }
}