package com.nomeacao.api.infra.monitoring;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        long inicio = System.currentTimeMillis();
        
        try {
            // Continua o processamento da requisição
            filterChain.doFilter(request, response);
        } finally {
            long tempoExecucao = System.currentTimeMillis() - inicio;
            String usuario = "ANONYMOUS";
            String path = request.getRequestURI();

            // Ignora rotas de infraestrutura para não poluir o log
            if (!path.startsWith("/actuator") && !path.startsWith("/swagger")) {
                
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                    usuario = auth.getName(); // No nosso caso, é o email
                }

                // [REQ] MÉTODO /caminho | STATUS | TEMPOms | USUÁRIO
                logger.info("[REQ] {} {} | {} | {}ms | {}", 
                    request.getMethod(),
                    path,
                    response.getStatus(),
                    tempoExecucao,
                    usuario
                );
            }
        }
    }
}