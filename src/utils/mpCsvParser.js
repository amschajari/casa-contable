const COLUMN_MAP = {
    date: ['fecha', 'date', 'fecha de operación', 'fecha operación'],
    description: ['descripción', 'description', 'titulo', 'título', 'concepto', 'detalle', 'nombre'],
    amount: ['neto', 'neto acreditado', 'monto', 'importe', 'monto bruto', 'bruto', 'total', 'valor'],
    type: ['tipo', 'tipo de operación', 'tipo operación', 'operation type'],
    status: ['estado', 'status'],
    reference: ['id', 'id operación', 'id de operación', 'referencia', 'código']
};

const CATEGORY_KEYWORDS = {
    'Alimentación': ['supermercado', 'coto', 'día', 'disco', 'chango', 'carrefour', 'alimentación', 'almacén', 'kiosco', 'verdulería', 'panadería', 'comida', 'restaurante', 'delivery', 'pedidos ya', 'rappi'],
    'Servicios': ['luz', 'gas', 'agua', 'edenor', 'metrogas', 'ayasa', 'telecentro', 'telecom', 'personal', 'movistar', 'claro', 'servicio', 'factura', 'expensas'],
    'Transporte': ['transporte', 'nafta', 'combustible', 'sube', 'taxi', 'uber', 'cabify', 'colectivo', 'tren', 'subte', 'peaje', 'estacionamiento'],
    'Salud': ['farmacia', 'farmacity', 'salud', 'médico', 'doctor', 'hospital', 'clinica', 'prepaga', 'osde', 'swiss medical', 'medicamento', 'óptica'],
    'Educación': ['educación', 'curso', 'universidad', 'colegio', 'cuota', 'libro', 'biblioteca'],
    'Entretenimiento': ['entretenimiento', 'netflix', 'spotify', 'disney', 'hbo', 'prime', 'cine', 'teatro', 'show', 'concierto', 'juego', 'suscripción'],
    'Hogar': ['hogar', 'sodimac', 'easy', 'farmito', 'mueble', 'decoración', 'ferretería', 'electricidad', 'pintura'],
    'Vestimenta': ['vestimenta', 'ropa', 'zapatilla', 'zapato', 'musimundo', 'fravega', 'indumentaria', 'deportes'],
    'Otros': []
};

const STATUS_MAP = {
    confirmed: ['confirmado', 'aprobado', 'acreditado', 'a creditado', 'completed', 'done', 'pagado', 'pago'],
    pending: ['pendiente', 'pending', 'en proceso', 'procesando', 'rechazado', 'rejected', 'cancelado', 'cancelled']
};

function detectColumnIndex(header, columnNames) {
    const headerLower = header.toLowerCase().trim();
    for (const name of columnNames) {
        if (headerLower === name) return true;
    }
    return false;
}

function guessCategory(description) {
    if (!description) return 'Otros';
    const desc = description.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const kw of keywords) {
            if (desc.includes(kw)) return category;
        }
    }
    return 'Otros';
}

function parseAmount(value) {
    if (!value) return 0;
    const cleaned = value.replace(/[^0-9,.-]/g, '');
    const hasComma = cleaned.includes(',');
    const hasDot = cleaned.replace(/^-/, '').includes('.');
    const hasSeparator = hasComma || hasDot;
    if (hasComma && hasDot) {
        const normalized = cleaned.replace(/\./g, '').replace(',', '.');
        const parsed = parseFloat(normalized);
        return isNaN(parsed) ? 0 : Math.abs(parsed);
    }
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.abs(parsed);
}

function parseDate(value) {
    if (!value) return new Date().toISOString().split('T')[0];
    const parts = value.split(/[/-]/);
    if (parts.length === 3) {
        if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        return `${parts[2].padStart(4, '20')}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return new Date(value).toISOString().split('T')[0];
}

function detectStatus(value) {
    if (!value) return 'CONFIRMED';
    const v = value.toLowerCase().trim();
    for (const s of STATUS_MAP.pending) {
        if (v.includes(s)) return 'PENDING';
    }
    return 'CONFIRMED';
}

export function parseMpCsv(csvText, userId) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = parseCsvLine(lines[0]);
    const colMap = {};
    for (const [field, names] of Object.entries(COLUMN_MAP)) {
        const idx = headers.findIndex(h => detectColumnIndex(h, names));
        if (idx !== -1) colMap[field] = idx;
    }

    const results = [];
    const seen = new Set();

    for (let i = 1; i < lines.length; i++) {
        const row = parseCsvLine(lines[i]);
        if (row.length < 2) continue;

        const description = colMap.description !== undefined ? row[colMap.description]?.trim() || '' : '';
        const amount = colMap.amount !== undefined ? parseAmount(row[colMap.amount]) : 0;
        const date = colMap.date !== undefined ? parseDate(row[colMap.date]) : new Date().toISOString().split('T')[0];
        const status = colMap.status !== undefined ? detectStatus(row[colMap.status]) : 'CONFIRMED';
        const csvType = colMap.type !== undefined ? (row[colMap.type]?.trim() || '').toLowerCase() : '';

        if (amount === 0) continue;
        if (csvType && (csvType.includes('extracción') || csvType.includes('retiro') || csvType.includes('withdrawal'))) continue;

        const normalizedDesc = description
            .replace(/\s+/g, ' ')
            .replace(/^Transferencia enviada\s*/i, '')
            .trim();

        const dedupKey = `${date}|${amount}|${normalizedDesc}`;
        if (seen.has(dedupKey)) continue;
        seen.add(dedupKey);

        results.push({
            type: 'GASTO',
            amount: amount,
            category: guessCategory(description),
            description: normalizedDesc,
            payment_method: 'Mercado Pago',
            date,
            status,
            user_id: userId
        });
    }

    return results;
}

function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}
