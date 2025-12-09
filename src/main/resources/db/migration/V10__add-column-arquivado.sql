-- Adiciona a coluna 'arquivado' na tabela de tópicos (Padrão falso)
ALTER TABLE topicos ADD COLUMN arquivado BOOLEAN NOT NULL DEFAULT FALSE;

-- Adiciona a coluna 'arquivado' na tabela de concursos (Padrão falso)
ALTER TABLE concursos ADD COLUMN arquivado BOOLEAN NOT NULL DEFAULT FALSE;