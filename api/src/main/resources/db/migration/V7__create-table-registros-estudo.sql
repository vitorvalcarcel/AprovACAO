CREATE TABLE registros_estudo (
    id BIGSERIAL PRIMARY KEY,
    data_inicio TIMESTAMP NOT NULL,
    minutos INTEGER NOT NULL,
    questoes_feitas INTEGER,
    questoes_certas INTEGER,
    anotacoes TEXT,
    
    usuario_id BIGINT NOT NULL,
    materia_id BIGINT NOT NULL,
    topico_id BIGINT,
    concurso_id BIGINT,
    tipo_estudo_id BIGINT,

    CONSTRAINT fk_reg_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_reg_materia FOREIGN KEY (materia_id) REFERENCES materias(id),
    CONSTRAINT fk_reg_topico FOREIGN KEY (topico_id) REFERENCES topicos(id),
    CONSTRAINT fk_reg_concurso FOREIGN KEY (concurso_id) REFERENCES concursos(id),
    CONSTRAINT fk_reg_tipo FOREIGN KEY (tipo_estudo_id) REFERENCES tipos_estudo(id)
);