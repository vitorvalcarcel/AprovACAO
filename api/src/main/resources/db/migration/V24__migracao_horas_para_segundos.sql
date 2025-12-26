-- 1. Cria novas colunas em CICLOS
ALTER TABLE ciclos ADD COLUMN total_segundos BIGINT;

-- 2. Migra os dados existentes (horas * 3600)
UPDATE ciclos SET total_segundos = CAST(total_horas * 3600 AS BIGINT) WHERE total_horas IS NOT NULL;

-- 3. Remove a coluna antiga
ALTER TABLE ciclos DROP COLUMN total_horas;


-- 4. Cria novas colunas em ITENS_CICLO
ALTER TABLE itens_ciclo ADD COLUMN segundos_meta BIGINT;

-- 5. Migra os dados existentes
UPDATE itens_ciclo SET segundos_meta = CAST(horas_meta * 3600 AS BIGINT) WHERE horas_meta IS NOT NULL;

-- 6. Remove a coluna antiga
ALTER TABLE itens_ciclo DROP COLUMN horas_meta;


-- 7. Cria novas colunas em CICLO_HISTORICO
ALTER TABLE ciclo_historico ADD COLUMN segundos_descontados BIGINT;

-- 8. Migra os dados existentes
UPDATE ciclo_historico SET segundos_descontados = CAST(horas_descontadas * 3600 AS BIGINT) WHERE horas_descontadas IS NOT NULL;

-- 9. Remove a coluna antiga
ALTER TABLE ciclo_historico DROP COLUMN horas_descontadas;
