CREATE TABLE topicos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    materia_id BIGINT NOT NULL,
    
    CONSTRAINT fk_topicos_materia_id FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
);