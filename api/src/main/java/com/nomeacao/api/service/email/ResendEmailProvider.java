package com.nomeacao.api.service.email;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import com.resend.core.exception.ResendException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ResendEmailProvider implements EmailSenderProvider {

    private static final Logger logger = LoggerFactory.getLogger(ResendEmailProvider.class);

    private final String apiKey;
    private final String from;

    public ResendEmailProvider(String apiKey, String from) {
        this.apiKey = apiKey;
        this.from = from;
    }

    @Override
    public void enviar(String para, String assunto, String conteudo) {
        try {
            Resend resend = new Resend(apiKey);

            String htmlFinal = buildHtmlTemplate(assunto, conteudo);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from("AprovAÇÃO <" + from + ">")
                    .to(para)
                    .subject(assunto)
                    .html(htmlFinal)
                    .build();

            CreateEmailResponse data = resend.emails().send(params);
            logger.info("Email enviado via Resend. ID: {}", data.getId());

        } catch (ResendException e) {
            logger.error("Erro ao enviar e-mail via Resend: {}", e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Erro inesperado ao enviar e-mail: {}", e.getMessage(), e);
        }
    }

    private String buildHtmlTemplate(String titulo, String conteudoPrincipal) {
        return String.format(
                """
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
                        """,
                conteudoPrincipal);
    }
}
