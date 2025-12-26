-- V25: Ensure transition to seconds (Repair V24)
-- Garante que a migração de horas para segundos seja aplicada caso V24 tenha sido ignorada ou falhado silenciosamente.

-- 1. CICLOS
ALTER TABLE ciclos ADD COLUMN IF NOT EXISTS total_segundos BIGINT;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ciclos' AND column_name='total_horas') THEN
        UPDATE ciclos SET total_segundos = CAST(total_horas * 3600 AS BIGINT) WHERE total_horas IS NOT NULL AND total_segundos IS NULL;
    END IF;
END $$;

ALTER TABLE ciclos DROP COLUMN IF EXISTS total_horas;

-- 2. ITENS_CICLO
ALTER TABLE itens_ciclo ADD COLUMN IF NOT EXISTS segundos_meta BIGINT;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='itens_ciclo' AND column_name='horas_meta') THEN
        UPDATE itens_ciclo SET segundos_meta = CAST(horas_meta * 3600 AS BIGINT) WHERE horas_meta IS NOT NULL AND segundos_meta IS NULL;
    END IF;
END $$;

ALTER TABLE itens_ciclo DROP COLUMN IF EXISTS horas_meta;

-- 3. CICLO_HISTORICO
ALTER TABLE ciclo_historico ADD COLUMN IF NOT EXISTS segundos_descontados BIGINT;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ciclo_historico' AND column_name='horas_descontadas') THEN
         UPDATE ciclo_historico SET segundos_descontados = CAST(horas_descontadas * 3600 AS BIGINT) WHERE horas_descontadas IS NOT NULL AND segundos_descontados IS NULL;
    END IF;
END $$;

ALTER TABLE ciclo_historico DROP COLUMN IF EXISTS horas_descontadas;
