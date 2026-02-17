-- Agregar columna de estado
ALTER TABLE movements 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'PENDING'));

-- Agregar columnas para cuotas
ALTER TABLE movements 
ADD COLUMN IF NOT EXISTS installment_number INTEGER,
ADD COLUMN IF NOT EXISTS total_installments INTEGER,
ADD COLUMN IF NOT EXISTS group_id UUID;

-- Nota: Recordar correr esto en el SQL Editor de Supabase.
