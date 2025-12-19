package com.nomeacao.api.dto;

import com.nomeacao.api.model.RegistroEstudo;
import java.time.LocalDateTime;

public record DadosDetalhamentoRegistro(
    Long id,
    Long materiaId,
    String nomeMateria,
    Long topicoId,
    String nomeTopico,
    Long tipoEstudoId,
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
            registro.getMateria().getId(),
            registro.getMateria().getNome(),
            registro.getTopico() != null ? registro.getTopico().getId() : null,
            registro.getTopico() != null ? registro.getTopico().getNome() : null,
            registro.getTipoEstudo() != null ? registro.getTipoEstudo().getId() : null,
            registro.getConcurso() != null ? registro.getConcurso().getNome() : null,
            registro.getDataInicio(),
            registro.getSegundos(),
            registro.getQuestoesFeitas(),
            registro.getQuestoesCertas(),
            registro.getAnotacoes()
        );
    }
}