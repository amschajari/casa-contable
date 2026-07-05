import React, { useState } from 'react';
import { X, Plus, Calendar, DollarSign, Tag, CreditCard, Type, Loader2, Clock, CheckCircle, History } from 'lucide-react';
import { useMovements } from '../hooks/useMovements';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';
import { getLocalDate } from '../utils/format';
import { CATEGORIES, PAYMENT_METHODS, INSTALLMENT_OPTIONS } from '../config/constants';

const DRAFT_KEY = 'movement_draft';

const getDefaultForm = (userId) => ({
    type: 'GASTO',
    amount: '',
    category: 'Alimentación',
    description: '',
    payment_method: 'Efectivo',
    date: getLocalDate(),
    status: 'CONFIRMED',
    total_installments: 1,
    user_id: userId
});

const MovementModal = ({ isOpen, onClose, onSuccess, movementToEdit = null }) => {
    const { addMovement, updateMovement } = useMovements();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(() => {
        if (movementToEdit) return movementToEdit;
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            try { return JSON.parse(saved); } catch {}
        }
        return getDefaultForm(user?.id);
    });

    React.useEffect(() => {
        if (!isOpen) return;
        if (movementToEdit) {
            setFormData({
                ...movementToEdit,
                amount: movementToEdit.amount.toString(),
                user_id: movementToEdit.user_id || user?.id
            });
        } else {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) {
                try { setFormData(JSON.parse(saved)); return; } catch {}
            }
            setFormData(getDefaultForm(user?.id));
        }
    }, [movementToEdit, user, isOpen]);

    React.useEffect(() => {
        if (!movementToEdit) {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        }
    }, [formData, movementToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const movementData = {
            ...formData,
            amount: parseFloat(formData.amount),
            user_id: user?.id || formData.user_id
        };
        try {
            if (movementToEdit) {
                await updateMovement(movementToEdit.id, movementData);
            } else {
                await addMovement(movementData);
            }

            Swal.fire({
                icon: 'success',
                title: movementToEdit ? '¡Actualizado!' : '¡Registrado!',
                text: movementToEdit ? 'Los cambios se guardaron correctamente.' : 'El movimiento se guardó correctamente.',
                timer: 1500,
                showConfirmButton: false,
                background: '#ffffff',
                color: '#1e293b'
            });

            localStorage.removeItem(DRAFT_KEY);
            onSuccess?.();
            onClose();
            setFormData(getDefaultForm(user?.id));
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el movimiento: ' + error.message,
                confirmButtonColor: '#4f46e5'
            });
        } finally {
            setLoading(false);
        }
    };

    const updateField = (updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    return (
        <div className="fixed inset-0 z-[200] flex justify-center items-start overflow-y-auto p-4 md:p-8 bg-slate-950/80 backdrop-blur-sm custom-scrollbar">
            <div className="bg-white dark:bg-slate-200 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-300 animate-in zoom-in-95 duration-200 my-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 p-8 border-b border-slate-100 dark:border-slate-300 flex justify-between items-center bg-white dark:bg-slate-100">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter leading-none">
                            {movementToEdit ? 'Editar Movimiento' : 'Nuevo Movimiento'}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-[0.2rem] mt-2">
                            {movementToEdit ? 'Actualizar Registro' : 'Registro de Finanzas'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <div className="overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Selector de Tipo */}
                        <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
                            {['INGRESO', 'GASTO', 'EMERGENCIA', 'AHORRO'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => updateField({ type })}
                                    className={`flex-1 py-2.5 px-1 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${formData.type === type
                                        ? 'bg-white dark:bg-brand text-brand dark:text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-amber-500'
                                        }`}
                                >
                                    <span className="flex items-center justify-center gap-1.5 w-full">
                                        {type === 'EMERGENCIA' ? <><span className="text-sm">🚨</span> Emer.</> : type === 'AHORRO' ? <><span className="text-sm">💰</span> Ahorro</> : type}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Monto */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-brand uppercase tracking-widest ml-1">Monto (ARS)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <DollarSign className="w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white border border-slate-200 dark:border-slate-300 rounded-2xl text-slate-900 font-black text-xl placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none"
                                        placeholder="0"
                                        value={formData.amount}
                                        onChange={(e) => updateField({ amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Fecha */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-brand uppercase tracking-widest ml-1">Fecha</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Calendar className="w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                                    </div>
                                    <input
                                        type="date"
                                        required
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white border border-slate-200 dark:border-slate-300 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none"
                                        value={formData.date}
                                        onChange={(e) => updateField({ date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Categoría */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-brand uppercase tracking-widest ml-1">Categoría</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Tag className="w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                                </div>
                                <select
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white border border-slate-200 dark:border-slate-300 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none appearance-none"
                                    value={formData.category}
                                    onChange={(e) => updateField({ category: e.target.value })}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.label} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-brand uppercase tracking-widest ml-1">Descripción / Detalle</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Type className="w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white border border-slate-200 dark:border-slate-300 rounded-2xl text-slate-900 font-bold text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none"
                                    placeholder="Ejem: Supermercado Coto, Ferretería El Clavo..."
                                    value={formData.description}
                                    onChange={(e) => updateField({ description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Método de Pago */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-brand uppercase tracking-widest ml-1">Método de Pago</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CreditCard className="w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                                    </div>
                                    <select
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white border border-slate-200 dark:border-slate-300 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none appearance-none"
                                        value={formData.payment_method}
                                        onChange={(e) => updateField({ payment_method: e.target.value })}
                                    >
                                        {PAYMENT_METHODS.map(method => (
                                            <option key={method} value={method}>{method}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-brand uppercase tracking-widest ml-1">Estado</label>
                                <button
                                    type="button"
                                    onClick={() => updateField({ status: formData.status === 'CONFIRMED' ? 'PENDING' : 'CONFIRMED' })}
                                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${formData.status === 'PENDING'
                                        ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
                                        : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {formData.status === 'PENDING' ? <Clock className="w-5 h-5 text-amber-500" /> : <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                        <span className={`font-black italic text-sm ${formData.status === 'PENDING' ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                            {formData.status === 'PENDING' ? 'Agendado / Pendiente' : 'Pagado / Confirmado'}
                                        </span>
                                    </div>
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.status === 'PENDING' ? 'bg-amber-400' : 'bg-emerald-400'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.status === 'PENDING' ? 'left-6' : 'left-1'}`}></div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Cuotas */}
                        {formData.type === 'GASTO' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-brand uppercase tracking-widest ml-1">Plan de Cuotas</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <History className="w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                                    </div>
                                    <select
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white border border-slate-200 dark:border-slate-300 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none appearance-none"
                                        value={formData.total_installments}
                                        onChange={(e) => updateField({ total_installments: parseInt(e.target.value) })}
                                    >
                                        {INSTALLMENT_OPTIONS.map(n => (
                                            <option key={n} value={n}>{n === 1 ? 'Sin cuotas (Pago único)' : `${n} Cuotas mensuales`}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand hover:bg-brand-dark text-white py-5 rounded-2xl font-black italic tracking-tight text-lg shadow-xl shadow-brand/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3 mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <span>{movementToEdit ? 'Guardar Cambios' : 'Guardar Movimiento'}</span>
                                    <Plus className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MovementModal;
