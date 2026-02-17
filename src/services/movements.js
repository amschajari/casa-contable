import { supabase } from './supabase';

export const movementsService = {
    async getAll() {
        const { data, error } = await supabase
            .from('movements')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async create(movement) {
        const { data, error } = await supabase
            .from('movements')
            .insert([movement])
            .select();

        if (error) throw error;
        return data[0];
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('movements')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    async delete(id) {
        const { error } = await supabase
            .from('movements')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async getSummary() {
        const { data, error } = await supabase
            .from('movements')
            .select('type, amount');

        if (error) throw error;

        const summary = data.reduce((acc, mov) => {
            if (mov.type === 'INGRESO') acc.totalIncome += Number(mov.amount);
            if (mov.type === 'GASTO') acc.totalExpenses += Number(mov.amount);
            if (mov.type === 'EMERGENCIA') acc.totalEmergency += Number(mov.amount);
            if (mov.type === 'AHORRO') acc.totalSavings += Number(mov.amount);
            return acc;
        }, { totalIncome: 0, totalExpenses: 0, totalEmergency: 0, totalSavings: 0 });

        // El balance es lo disponible para gastar: Ingresos - (Gastos + Emergencia + Ahorro)
        summary.balance = summary.totalIncome - (summary.totalExpenses + summary.totalEmergency + summary.totalSavings);
        return summary;
    }
};
