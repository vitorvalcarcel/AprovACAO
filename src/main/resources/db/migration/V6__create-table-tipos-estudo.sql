CREATE TABLE tipos_estudo (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    usuario_id BIGINT NOT NULL,
    CONSTRAINT fk_tipos_usuario_id FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);