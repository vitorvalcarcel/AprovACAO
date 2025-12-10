-- 1. Adiciona as colunas novas que o Java está pedindo
ALTER TABLE ciclos ADD COLUMN descricao VARCHAR(255);
ALTER TABLE ciclos ADD COLUMN total_horas DOUBLE PRECISION;

-- 2. Remove a obrigatoriedade da coluna antiga 'data_inicio'
-- (O novo código não usa esse campo, então se deixar NOT NULL vai dar erro ao salvar)
ALTER TABLE ciclos ALTER COLUMN data_inicio DROP NOT NULL;