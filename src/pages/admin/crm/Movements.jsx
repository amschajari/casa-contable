import React, { useEffect, useState, useMemo } from 'react';
import { useMovements } from '../../../hooks/useMovements';
import SearchBar from '../../../components/SearchBar';
import { History, TrendingUp, TrendingDown, Wallet, Calendar, Tag, AlertCircle } from 'lucide-react';

const Movements = () => {
    const { movements, loading, fetchMovements } = useMovements();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMovements();
    }, [fetchMovements]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getTypeConfig = (type) => {
        switch (type) {
            case 'INGRESO': return { label: 'Ingreso', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', icon: <TrendingUp className="w-3 h-3" /> };
            case 'GASTO': return { label: 'Gasto', color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400', icon: <TrendingDown className="w-3 h-3" /> };
            case 'EMERGENCIA': return { label: 'Emergencia', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', icon: <AlertCircle className="w-3 h-3" /> };
            case 'AHORRO': return { label: 'Ahorro', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400', icon: <Wallet className="w-3 h-3" /> };
            default: return { label: 'Otro', color: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-400', icon: <History className="w-3 h-3" /> };
        }
    };

    // Lógica de filtrado
    const filteredMovements = useMemo(() => {
        if (!movements) return [];
        if (!searchTerm) return movements;
        const searchLower = searchTerm.toLowerCase();
        return movements.filter(m =>
            m.description?.toLowerCase().includes(searchLower) ||
            m.category?.toLowerCase().includes(searchLower) ||
            m.type?.toLowerCase().includes(searchLower) ||
            m.payment_method?.toLowerCase().includes(searchLower)
        );
    }, [movements, searchTerm]);

    const totals = useMemo(() => {
        return filteredMovements.reduce((acc, m) => {
            if (m.type === 'INGRESO') acc.income += Number(m.amount);
            if (m.type === 'GASTO') acc.expenses += Number(m.amount);
            return acc;
        }, { income: 0, expenses: 0, balance: 0 });
    }, [filteredMovements]);

    if (loading && movements.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-10">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Cargando historial...</p>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-8 max-w-7xl mx-auto flex flex-col flex-1 w-full py-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none mb-2">
                        Historial
                    </h1>
                    <p className="text-slate-400 dark:text-gray-500 text-[10px] md:text-xs uppercase tracking-[0.3rem] font-black opacity-80">
                        Libro Diario del Hogar
                    </p>
                </div>

                <div className="flex items-center gap-6 bg-white dark:bg-white/5 p-4 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2rem] mb-1">Balance Sesión</p>
                        <p className={`text-2xl font-black leading-none italic ${totals.income - totals.expenses >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {formatCurrency(totals.income - totals.expenses)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="bg-white dark:bg-white/5 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 flex flex-col overflow-hidden h-full">
                    <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                        <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            placeholder="Buscar por descripción, categoría o tipo..."
                        />
                    </div>

                    <div className="hidden md:block overflow-x-auto flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-[40] bg-slate-50 dark:bg-slate-900 shadow-sm">
                                <tr className="italic">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2rem] border-b border-slate-200 dark:border-white/5">Fecha</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2rem] border-b border-slate-200 dark:border-white/5 w-1/4">Descripción</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2rem] border-b border-slate-200 dark:border-white/5">Categoría</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2rem] border-b border-slate-200 dark:border-white/5">Tipo</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2rem] text-right border-b border-slate-200 dark:border-white/5">Monto</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2rem] border-b border-slate-200 dark:border-white/5">Pago</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {filteredMovements.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 italic font-bold uppercase tracking-widest text-xs">
                                            No se encontraron registros
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMovements.map((mov) => {
                                        const config = getTypeConfig(mov.type);
                                        return (
                                            <tr key={mov.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                                <td className="px-8 py-5">
                                                    <p className="text-slate-500 dark:text-gray-400 font-bold whitespace-nowrap tabular-nums flex items-center gap-3 text-xs">
                                                        <Calendar className="w-4 h-4 opacity-40" /> {formatDate(mov.date)}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="font-black text-slate-800 dark:text-white text-xl tracking-tighter italic leading-none">{mov.description || 'Sin descripción'}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-[10px] text-slate-500 dark:text-gray-400 font-black uppercase tracking-widest leading-none border border-slate-200 dark:border-white/10 px-3 py-1 rounded-full w-fit bg-white dark:bg-transparent">{mov.category}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter whitespace-nowrap flex items-center gap-2 w-fit shadow-sm ${config.color}`}>
                                                        {config.icon} {config.label}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <p className={`text-2xl font-black italic tracking-tighter leading-none ${mov.type === 'INGRESO' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                        {formatCurrency(mov.amount)}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.15rem] italic">{mov.payment_method}</p>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Vista Mobile */}
                    <div className="md:hidden overflow-y-auto px-4 py-8 space-y-6 flex-1 custom-scrollbar bg-slate-50/30 dark:bg-black/20">
                        {filteredMovements.map((mov) => {
                            const config = getTypeConfig(mov.type);
                            return (
                                <div key={mov.id} className="bg-white dark:bg-white/5 rounded-3xl shadow-xl border border-slate-100 dark:border-white/5 p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <History className="w-12 h-12" />
                                    </div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white text-xl italic tracking-tighter leading-tight">{mov.description || 'Sin descripción'}</h3>
                                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest mt-1 italic">{formatDate(mov.date)}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 shadow-sm ${config.color}`}>
                                            {config.icon} {config.label}
                                        </span>
                                    </div>
                                    <div className="mb-4">
                                        <p className={`text-4xl font-black italic tracking-tighter ${mov.type === 'INGRESO' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {formatCurrency(mov.amount)}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{mov.category}</span>
                                        <span className="text-[10px] text-slate-700 dark:text-gray-300 font-bold italic bg-slate-50 dark:bg-white/5 px-3 py-1 rounded-lg">{mov.payment_method}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Movements;
