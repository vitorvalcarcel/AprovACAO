-- Renomeia a coluna para ficar claro o que ela guarda
ALTER TABLE registros_estudo RENAME COLUMN minutos TO segundos;

-- (Opcional) Se tiver dados antigos em minutos, multiplica por 60 para virar segundos
-- UPDATE registros_estudo SET segundos = segundos * 60;