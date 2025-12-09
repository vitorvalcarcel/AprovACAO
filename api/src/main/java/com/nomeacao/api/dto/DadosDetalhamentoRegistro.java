package com.nomeacao.api.dto;

import com.nomeacao.api.model.RegistroEstudo;
import java.time.LocalDateTime;

public record DadosDetalhamentoRegistro(
    Long id,
    String nomeMateria,
    String nomeTopico,
    LocalDateTime dataInicio,
    Integer minutos,
    Integer questoesFeitas,
    Integer questoesCertas
) {
    public DadosDetalhamentoRegistro(RegistroEstudo r) {
        this(
            r.getId(),
            r.getMateria().getNome(),
            r.getTopico() != null ? r.getTopico().getNome() : null,
            r.getDataInicio(),
            r.getMinutos(),
            r.getQuestoesFeitas(),
            r.getQuestoesCertas()
        );
    }
}