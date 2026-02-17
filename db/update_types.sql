-- Actualizar restricción de tipos de movimientos
ALTER TABLE movements DROP CONSTRAINT IF EXISTS movements_type_check;

ALTER TABLE movements ADD CONSTRAINT movements_type_check 
CHECK (type IN ('INGRESO', 'GASTO', 'EMERGENCIA', 'AHORRO', 'CONSUMO'));

-- Nota: Mantengo 'CONSUMO' por compatibilidad, pero los nuevos serán los sugeridos.
