CREATE TABLE ciclos (
    id BIGSERIAL PRIMARY KEY,
    data_inicio TIMESTAMP NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    anotacoes TEXT,
    concurso_id BIGINT NOT NULL,
    CONSTRAINT fk_ciclo_concurso FOREIGN KEY (concurso_id) REFERENCES concursos(id) ON DELETE CASCADE
);

CREATE TABLE itens_ciclo (
    id BIGSERIAL PRIMARY KEY,
    horas_meta DOUBLE PRECISION NOT NULL,
    ciclo_id BIGINT NOT NULL,
    materia_id BIGINT NOT NULL,
    CONSTRAINT fk_item_ciclo FOREIGN KEY (ciclo_id) REFERENCES ciclos(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_materia FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
);