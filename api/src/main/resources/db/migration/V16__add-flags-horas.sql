-- Adiciona a configuração no TIPO (Padrão: Sim, conta horas)
ALTER TABLE tipos_estudo ADD COLUMN conta_horas_ciclo BOOLEAN DEFAULT TRUE;

-- Adiciona o registro no REGISTRO (Padrão: Sim, conta horas)
ALTER TABLE registros_estudo ADD COLUMN contar_horas_no_ciclo BOOLEAN DEFAULT TRUE;