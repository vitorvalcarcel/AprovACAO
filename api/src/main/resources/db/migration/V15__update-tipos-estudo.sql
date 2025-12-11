ALTER TABLE tipos_estudo ADD COLUMN arquivado BOOLEAN DEFAULT FALSE;

-- Garante que os existentes não fiquem nulos
UPDATE tipos_estudo SET arquivado = false WHERE arquivado IS NULL;
ALTER TABLE tipos_estudo ALTER COLUMN arquivado SET NOT NULL;