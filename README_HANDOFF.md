# Master Handoff: Proyecto "Casa Contable" 🏠💰

Este documento es la **fuente de verdad** para el desarrollo del sistema de gestión de gastos e ingresos domésticos, heredando la arquitectura y estética premium de **Clicando CRM**.

## 🎯 Objetivo
Crear una herramienta de control financiero personal con **soporte multi-usuario**. Debe registrar quién carga cada dato para resúmenes comparativos.

## 👥 Autenticación y Usuarios
- **Sistema**: Supabase Auth (Email/Password).
- **Alcance**: 2 usuarios iniciales (expandible).
- **Rastreo**: Cada registro (movimiento) debe llevar el `user_id` de la sesión activa.

### IDs de Usuarios Registrados
| Usuario | user_id (UUID) |
|---------|----------------|
| Silvina | `18d11914-7b1a-4ff0-a121-a5f0fd668026` |
| ALE | `e8e1a9ee-8a3d-4e8a-b12f-aed264d54d7b` |

> ⚠️ **Importante**: Estos IDs se usan en el frontend para mostrar las iniciales "S" y "A" en los movimientos. Si se agregan nuevos usuarios, actualizar las constantes en `Dashboard.jsx` y `Movements.jsx`.

## 🏗️ Arquitectura (Basada en Clicando)
- **UI Pattern**: Clonar la estética de `Payments.jsx` y `Dashboard.jsx` de Clicando.
- **Backend**: Supabase con RLS habilitado.
- **Módulo de Movimientos**: Reemplaza al de "Leads". Enfocado en Ingresos, Gastos y Consumos.

## 💾 Schema de Base de Datos
Ejecutar en Supabase:

```sql
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
-- (Opcional) Si quieren ver los gastos del otro para el resumen compartido:
-- CREATE POLICY "Lectura Compartida" ON movements FOR SELECT USING (true);
```

## 📂 Archivos de Referencia en 'casa-contable'
- `src/pages/admin/crm/Payments.jsx` → Base para `Movements.jsx`.
- `src/pages/admin/crm/Dashboard.jsx` → Base para el Resumen Financiero.

## 📱 Soporte PWA (Mobile First)
El usuario desea que el sistema funcione como una **PWA** para que los 2 usuarios actuales puedan instalar el acceso directo en sus móviles.

**Requisitos para el Agente:**
- Instalar `vite-plugin-pwa`.
- Configurar el `manifest.json` con iconos y colores temáticos.
- Asegurar que la UI sea 100% responsiva (Mobile-First).

## 🐛 Correcciones Conocidas (Feb 2026)

### Error de Timezone (Desfase de Fechas)
**Problema**: Los gastos se visualizaban con un día de retraso debido al uso de `new Date(dateString)` que interpreta fechas UTC sin hora como medianoche UTC, causando desfase en zonas horarias como Argentina (UTC-3).

**Solución implementada**:
- En `MovementModal.jsx`: Función `getLocalDate()` que ajusta el offset de minutos antes de convertir a ISO.
- En `Movements.jsx`: Función `formatDate()` que usa `.split('-')` para evitar conversiones de timezone.
- En `Dashboard.jsx`: Función `getDateParts()` que extrae año/mes directamente del string YYYY-MM-DD.

### Error de Identidad de Usuario
**Problema**: Los movimientos de Silvi aparecían con "A" en lugar de "S" porque el ID hardcodeado era incorrecto.

**Solución**: Actualizar los IDs en `Dashboard.jsx` y `Movements.jsx` con los valores correctos de la tabla `auth.users`.

## 🚀 Pasos de Inicialización
1. Copiar carpeta `.agent` para mantener las habilidades de Antigravity.
2. Configurar `.env` con las credenciales de la nueva cuenta Supabase.
3. Instalar dependencias: `npm install vite-plugin-pwa --save-dev`.
4. Adaptar el `Dashboard` para mostrar el balance total (Ingresos - Gastos).


