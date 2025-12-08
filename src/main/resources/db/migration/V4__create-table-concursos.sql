CREATE TABLE concursos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    banca VARCHAR(50),
    data_prova DATE,
    usuario_id BIGINT NOT NULL,
    
    CONSTRAINT fk_concursos_usuario_id FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);