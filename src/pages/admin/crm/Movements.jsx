import React, { useEffect, useState, useMemo } from 'react';
import { useMovements } from '../../../hooks/useMovements';
import SearchBar from '../../../components/SearchBar';
import { History, TrendingUp, TrendingDown, Wallet, Calendar, Tag, AlertCircle, Clock, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import MovementModal from '../../../components/MovementModal';
import Swal from 'sweetalert2';

const Movements = () => {
    const { movements, loading, fetchMovements, confirmMovement, deleteMovement } = useMovements();
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [movementToEdit, setMovementToEdit] = useState(null);

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

    const formatDate = (dateString, showTime = false, createdAt = null) => {
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

    const getTypeConfig = (type) => {
        switch (type) {
            case 'INGRESO': return { label: 'Ingreso', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', icon: <TrendingUp className="w-3 h-3" /> };
            case 'GASTO': return { label: 'Gasto', color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400', icon: <TrendingDown className="w-3 h-3" /> };
            case 'EMERGENCIA': return { label: 'Emergencia', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', icon: <AlertCircle className="w-3 h-3" /> };
            case 'AHORRO': return { label: 'Ahorro', color: 'bg-brand-100 text-brand-dark dark:bg-brand-500/10 dark:text-brand', icon: <Wallet className="w-3 h-3" /> };
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
                <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin mb-4"></div>
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
                <div className="premium-card flex flex-col overflow-hidden h-full">
                    <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-100 border-b border-slate-100 dark:border-slate-200">
                        <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            placeholder="Buscar por descripción, categoría o tipo..."
                        />
                    </div>

                    <div className="hidden md:block overflow-x-auto flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-[40] bg-slate-50 dark:bg-slate-200 shadow-sm">
                                <tr className="italic">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2rem] border-b border-slate-200 dark:border-slate-300">Fecha</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2rem] border-b border-slate-200 dark:border-slate-300 w-1/4">Descripción</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2rem] border-b border-slate-200 dark:border-slate-300">Categoría</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2rem] border-b border-slate-200 dark:border-slate-300">Tipo</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2rem] text-right border-b border-slate-200 dark:border-slate-300">Monto</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2rem] border-b border-slate-200 dark:border-slate-300">Pago</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2rem] text-center border-b border-slate-200 dark:border-slate-300">Acciones</th>
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
                                            <tr key={mov.id} className={`group transition-all ${mov.status === 'PENDING' ? 'bg-amber-50/30 dark:bg-amber-500/5' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                                                <td className="px-8 py-5">
                                                    <p className="text-slate-500 dark:text-slate-600 font-bold whitespace-nowrap tabular-nums flex items-center gap-3 text-xs">
                                                        <Calendar className="w-4 h-4 opacity-70" /> {formatDate(mov.date, true, mov.created_at)}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-3">
                                                            <p className="font-black text-slate-800 text-xl tracking-tighter italic leading-none">{mov.description || 'Sin descripción'}</p>
                                                            <div className={`w-7 h-7 flex items-center justify-center rounded-full border text-xs font-black transition-all ${mov.user_id === '18d11914-7b1a-4ff0-a121-a5f0fd668026'
                                                                ? 'bg-pink-50 dark:bg-pink-500/10 text-pink-500 border-pink-200/50'
                                                                : 'bg-brand-50 dark:bg-brand-500/10 text-brand border-brand-200/50'
                                                                }`}>
                                                                {mov.user_id === '18d11914-7b1a-4ff0-a121-a5f0fd668026' ? 'S' : 'A'}
                                                            </div>
                                                            {mov.total_installments > 1 && (
                                                                <span className="bg-brand-100/50 dark:bg-brand-200 text-brand dark:text-brand-dark text-[8px] font-black px-2 py-0.5 rounded-full">
                                                                    {mov.installment_number}/{mov.total_installments}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-600 font-black uppercase tracking-widest leading-none border border-slate-200 dark:border-slate-300 px-3 py-1 rounded-full w-fit bg-white dark:bg-slate-50">{mov.category}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col gap-2">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter whitespace-nowrap flex items-center gap-2 w-fit shadow-sm ${config.color}`}>
                                                            {config.icon} {config.label}
                                                        </span>
                                                        {mov.status === 'PENDING' && (
                                                            <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter flex items-center gap-1 w-fit">
                                                                <Clock className="w-3 h-3" /> Agendado
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <p className={`text-2xl font-black italic tracking-tighter leading-none ${mov.type === 'INGRESO' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                        {formatCurrency(mov.amount)}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setMovementToEdit(mov);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            className="p-2.5 bg-slate-100 hover:bg-brand hover:text-white dark:bg-slate-200 text-slate-400 dark:text-slate-500 rounded-xl transition-all active:scale-95 group"
                                                            title="Editar"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                const result = await Swal.fire({
                                                                    title: '¿Eliminar registro?',
                                                                    text: "Esta acción no se puede deshacer.",
                                                                    icon: 'warning',
                                                                    showCancelButton: true,
                                                                    confirmButtonColor: '#ef4444',
                                                                    cancelButtonColor: '#94a3b8',
                                                                    confirmButtonText: 'Sí, eliminar',
                                                                    cancelButtonText: 'Cancelar',
                                                                    background: '#ffffff',
                                                                    color: '#1e293b'
                                                                });

                                                                if (result.isConfirmed) {
                                                                    await deleteMovement(mov.id);
                                                                    Swal.fire({
                                                                        title: 'Eliminado',
                                                                        icon: 'success',
                                                                        timer: 1000,
                                                                        showConfirmButton: false
                                                                    });
                                                                }
                                                            }}
                                                            className="p-2.5 bg-slate-100 hover:bg-rose-500 hover:text-white dark:bg-slate-200 text-slate-400 dark:text-slate-500 rounded-xl transition-all active:scale-95 group"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Vista Mobile */}
                    <div className="md:hidden overflow-y-auto px-4 py-8 space-y-6 flex-1 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
                        {filteredMovements.map((mov) => {
                            const config = getTypeConfig(mov.type);
                            return (
                                <div key={mov.id} className={`bg-white dark:bg-slate-50 rounded-3xl shadow-xl border p-6 relative overflow-hidden group transition-all ${mov.status === 'PENDING' ? 'border-dashed border-amber-300 dark:border-amber-500/30' : 'border-slate-100 dark:border-slate-200'}`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <History className="w-12 h-12" />
                                    </div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-slate-900 text-xl italic tracking-tighter leading-tight">{mov.description || 'Sin descripción'}</h3>
                                                <div className={`w-7 h-7 flex items-center justify-center rounded-full border text-xs font-black transition-all ${mov.user_id === '18d11914-7b1a-4ff0-a121-a5f0fd668026'
                                                    ? 'bg-pink-50 dark:bg-pink-500/10 text-pink-500 border-pink-200/50'
                                                    : 'bg-brand-50 dark:bg-brand-500/10 text-brand border-brand-200/50'
                                                    }`}>
                                                    {mov.user_id === '18d11914-7b1a-4ff0-a121-a5f0fd668026' ? 'S' : 'A'}
                                                </div>
                                                {mov.total_installments > 1 && (
                                                    <span className="bg-brand-100/50 dark:bg-brand-200 text-brand dark:text-brand-dark text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
                                                        {mov.installment_number}/{mov.total_installments}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 italic flex items-center gap-2">
                                                <Calendar className="w-3 h-3 opacity-70" /> {formatDate(mov.date, true, mov.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 shadow-sm ${config.color}`}>
                                                {config.icon} {config.label}
                                            </span>
                                            {mov.status === 'PENDING' && (
                                                <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Agendado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <p className={`text-4xl font-black italic tracking-tighter ${mov.type === 'INGRESO' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {formatCurrency(mov.amount)}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setMovementToEdit(mov);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-3 bg-slate-50 text-slate-400 rounded-xl active:scale-95"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const result = await Swal.fire({
                                                        title: '¿Eliminar?',
                                                        icon: 'warning',
                                                        showCancelButton: true,
                                                        confirmButtonColor: '#ef4444',
                                                        confirmButtonText: 'Eliminar'
                                                    });
                                                    if (result.isConfirmed) await deleteMovement(mov.id);
                                                }}
                                                className="p-3 bg-slate-50 text-slate-400 rounded-xl active:scale-95"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            {mov.status === 'PENDING' && (
                                                <button
                                                    onClick={async () => {
                                                        await confirmMovement(mov.id);
                                                    }}
                                                    className="p-3 bg-emerald-500 text-white rounded-xl active:scale-95"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-bold italic bg-slate-100 dark:bg-slate-200 px-3 py-1 rounded-lg tabular-nums">{mov.payment_method}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <MovementModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setMovementToEdit(null);
                }}
                onSuccess={() => fetchMovements()}
                movementToEdit={movementToEdit}
            />
        </div>
    );
};

export default Movements;
