ALTER TABLE itens_ciclo ADD COLUMN ordem INTEGER;

-- Atualiza os registros existentes (se houver) para não dar erro de nulo
UPDATE itens_ciclo SET ordem = 1 WHERE ordem IS NULL;

-- Agora que todos têm valor, podemos travar para não aceitar nulo
ALTER TABLE itens_ciclo ALTER COLUMN ordem SET NOT NULL;