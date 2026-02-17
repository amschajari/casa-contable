-- Tabla Principal de Movimientos
CREATE TABLE movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  amount NUMERIC(10,2) NOT NULL,
  type TEXT CHECK (type IN ('INGRESO', 'GASTO', 'CONSUMO')),
  category TEXT DEFAULT 'General',
  description TEXT,
  payment_method TEXT DEFAULT 'Efectivo',
  date DATE DEFAULT CURRENT_DATE,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid() -- RASTREO DE USUARIO
);

-- Habilitar Seguridad
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver y crear sus propios movimientos
CREATE POLICY "Privacidad Total" ON movements FOR ALL USING (auth.uid() = user_id);

-- (Opcional) Lectura compartida para el resumen del hogar
CREATE POLICY "Lectura Compartida" ON movements FOR SELECT USING (true);
