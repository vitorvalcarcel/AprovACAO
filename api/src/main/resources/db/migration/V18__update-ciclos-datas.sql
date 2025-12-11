-- Adiciona coluna data_fim para registrar o encerramento
ALTER TABLE ciclos ADD COLUMN data_fim TIMESTAMP;

-- Garante que data_inicio tenha valor nos registros existentes (caso algum tenha ficado nulo na migração V13)
UPDATE ciclos SET data_inicio = CURRENT_TIMESTAMP WHERE data_inicio IS NULL;