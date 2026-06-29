import { supabase } from './supabase';

export const movementsService = {
    async getAll() {
        const { data, error } = await supabase
            .from('movements')
            .select('*')
            .order('date', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async create(movement) {
        if (movement.total_installments > 1) {
            const groupId = crypto.randomUUID();
            const movements = [];
            const baseDate = new Date(movement.date);

            for (let i = 1; i <= movement.total_installments; i++) {
                const installmentDate = new Date(baseDate);
                installmentDate.setMonth(baseDate.getMonth() + (i - 1));

                movements.push({
                    ...movement,
                    date: installmentDate.toISOString().split('T')[0],
                    installment_number: i,
                    group_id: groupId,
                    status: i === 1 ? 'CONFIRMED' : 'PENDING' // La primera se confirma, el resto pendientes
                });
            }

            const { data, error } = await supabase
                .from('movements')
                .insert(movements)
                .select();

            if (error) throw error;
            return data[0];
        }

        const { data, error } = await supabase
            .from('movements')
            .insert([movement])
            .select();

        if (error) throw error;
        return data[0];
    },

    async update(id, movement) {
        const { data, error } = await supabase
            .from('movements')
            .update(movement)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    async confirm(id) {
        const { data, error } = await supabase
            .from('movements')
            .update({ status: 'CONFIRMED' })
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

    async getLastMpDate() {
        const { data, error } = await supabase
            .from('movements')
            .select('date')
            .eq('payment_method', 'Mercado Pago')
            .order('date', { ascending: false })
            .limit(1);

        if (error) throw error;
        return data?.[0]?.date || null;
    },

    async deleteByPaymentMethod(paymentMethod, sinceDate) {
        let query = supabase
            .from('movements')
            .delete()
            .eq('payment_method', paymentMethod);
        if (sinceDate) {
            query = query.gte('date', sinceDate);
        }
        const { data, error } = await query.select();
        if (error) throw error;
        return data;
    },

    async bulkCreate(movements) {
        const { data, error } = await supabase
            .from('movements')
            .insert(movements)
            .select();

        if (error) throw error;
        return data;
    },

    async getSummary() {
        const { data, error } = await supabase
            .from('movements')
            .select('type, amount, status')
            .eq('status', 'CONFIRMED');

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
