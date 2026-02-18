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

-- =====================================================
-- CONSULTAS ÚTILES PARA ADMINISTRACIÓN
-- =====================================================

-- Ver todos los usuarios registrados con sus IDs
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- Ver movimientos agrupados por usuario
-- SELECT 
--   u.email,
--   m.user_id,
--   COUNT(*) as total_movimientos,
--   SUM(CASE WHEN m.type = 'INGRESO' THEN m.amount ELSE 0 END) as ingresos,
--   SUM(CASE WHEN m.type = 'GASTO' THEN m.amount ELSE 0 END) as gastos
-- FROM movements m
-- JOIN auth.users u ON u.id = m.user_id
-- GROUP BY u.email, m.user_id;

-- IDs DE USUARIOS REGISTRADOS:
-- Silvina: 18d11914-7b1a-4ff0-a121-a5f0fd668026
-- ALE: e8e1a9ee-8a3d-4e8a-b12f-aed264d54d7b
