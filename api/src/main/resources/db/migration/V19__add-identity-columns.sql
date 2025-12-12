-- Adiciona colunas para controle de identidade e verificação de e-mail
ALTER TABLE usuarios ADD COLUMN ativo BOOLEAN DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN codigo_verificacao VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN validade_codigo TIMESTAMP;

-- Index para buscar tokens rapidamente
CREATE INDEX idx_usuario_codigo ON usuarios(codigo_verificacao);

-- Para não quebrar usuários existentes em dev, vamos ativá-los
UPDATE usuarios SET ativo = TRUE WHERE ativo IS NULL;
ALTER TABLE usuarios ALTER COLUMN ativo SET NOT NULL;