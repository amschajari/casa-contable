export const formatCurrency = (amount, options = {}) => {
    const {
        currency = 'ARS',
        locale = 'es-AR',
        minimumFractionDigits = 0,
        maximumFractionDigits = 0
    } = options;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits
    }).format(amount);
};

export const formatDate = (dateString, showTime = false, createdAt = null) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    let result = `${day}/${month}/${year}`;

    if (showTime && createdAt) {
        const time = new Date(createdAt).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        result += ` • ${time}`;
    }
    return result;
};

export const getDateParts = (dateString) => {
    if (!dateString) return { year: null, month: null };
    const [year, month] = dateString.split('-').map(Number);
    return { year, month: month - 1 };
};

export const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

export const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
