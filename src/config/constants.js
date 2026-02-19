export const USER_IDS = {
    SILVI: '18d11914-7b1a-4ff0-a121-a5f0fd668026',
    ALE: 'e8e1a9ee-8a3d-4e8a-b12f-aed264d54d7b'
};

export const USER_EMAILS = {
    ALE: 'a.m.saposnik@gmail.com',
    SILVI: 'silvinaeme@gmail.com'
};

export const MOVEMENT_TYPES = {
    INGRESO: 'INGRESO',
    GASTO: 'GASTO',
    EMERGENCIA: 'EMERGENCIA',
    AHORRO: 'AHORRO'
};

export const MOVEMENT_STATUS = {
    CONFIRMED: 'CONFIRMED',
    PENDING: 'PENDING'
};

export const CATEGORIES = [
    { label: '🛒 Alimentación / Super', value: 'Alimentación' },
    { label: '💡 Servicios (Luz, Gas, etc)', value: 'Servicios' },
    { label: '⛽ Transporte / Nafta', value: 'Transporte' },
    { label: '💊 Salud / Farmacia', value: 'Salud' },
    { label: '🎓 Educación', value: 'Educación' },
    { label: '🎬 Entretenimiento', value: 'Entretenimiento' },
    { label: '🏠 Hogar', value: 'Hogar' },
    { label: '👕 Vestimenta', value: 'Vestimenta' },
    { label: '💰 Sueldo', value: 'Sueldo' },
    { label: '📄 Honorarios', value: 'Honorarios' },
    { label: '🤝 Venta', value: 'Venta' },
    { label: '🏦 Préstamo', value: 'Préstamo' },
    { label: '📈 Inversión', value: 'Inversión' },
    { label: '🎁 Regalo', value: 'Regalo' },
    { label: '✨ Otros', value: 'Otros' }
];

export const PAYMENT_METHODS = [
    'Efectivo',
    'Tarjeta Débito',
    'Tarjeta Crédito',
    'Mercado Pago',
    'Transferencia Bancaria'
];

export const INSTALLMENT_OPTIONS = [1, 2, 3, 6, 9, 12, 18, 24];

export const getUserDisplayName = (email) => {
    if (email === USER_EMAILS.ALE) return 'ALE';
    if (email === USER_EMAILS.SILVI) return 'SILVI';
    return email?.split('@')[0].toUpperCase();
};

export const getUserInitial = (userId) => {
    if (userId === USER_IDS.SILVI) return 'S';
    return 'A';
};
