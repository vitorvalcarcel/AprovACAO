package com.nomeacao.api.dto;

import com.nomeacao.api.model.RegistroEstudo;
import java.time.LocalDateTime;

public record DadosDetalhamentoRegistro(
    Long id,
    String nomeMateria,
    String nomeTopico,
    String nomeConcurso,
    LocalDateTime dataInicio,
    Integer segundos,
    Integer questoesFeitas,
    Integer questoesCertas,
    String anotacoes
) {
    public DadosDetalhamentoRegistro(RegistroEstudo registro) {
        this(
            registro.getId(),
            registro.getMateria().getNome(),
            registro.getTopico() != null ? registro.getTopico().getNome() : null,
            registro.getConcurso() != null ? registro.getConcurso().getNome() : null,
            registro.getDataInicio(),
            registro.getSegundos(),
            registro.getQuestoesFeitas(),
            registro.getQuestoesCertas(),
            registro.getAnotacoes()
        );
    }
}