CREATE TABLE ciclo_historico (
    id BIGSERIAL PRIMARY KEY,
    ciclo_id BIGINT NOT NULL,
    materia_id BIGINT NOT NULL,
    horas_descontadas DOUBLE PRECISION NOT NULL DEFAULT 0,
    questoes_descontadas INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT fk_hist_ciclo FOREIGN KEY (ciclo_id) REFERENCES ciclos(id) ON DELETE CASCADE,
    CONSTRAINT fk_hist_materia FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
);