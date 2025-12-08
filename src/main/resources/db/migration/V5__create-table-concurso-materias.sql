CREATE TABLE concurso_materias (
    id BIGSERIAL PRIMARY KEY,
    concurso_id BIGINT NOT NULL,
    materia_id BIGINT NOT NULL,
    peso DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    questoes_prova INTEGER NOT NULL,

    CONSTRAINT fk_cm_concurso_id FOREIGN KEY (concurso_id) REFERENCES concursos(id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_materia_id FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    CONSTRAINT uk_concurso_materia UNIQUE (concurso_id, materia_id)
);