import React, { useState } from 'react';
import { X, Plus, Calendar, DollarSign, Tag, CreditCard, Type, Loader2 } from 'lucide-react';
import { useMovements } from '../hooks/useMovements';
import Swal from 'sweetalert2';

const CATEGORIES = [
    { label: 'Supermercado / Almacén', value: 'Alimentación' },
    { label: 'Ferretería / Bazar', value: 'Hogar' },
    { label: 'Rotisería / Delivery', value: 'Comida' },
    { label: 'Perfumería / Farmacia', value: 'Salud' },
    { label: 'Médico / Odontólogo', value: 'Salud' },
    { label: 'Ropa / Calzado', value: 'Vestimenta' },
    { label: 'Servicios (Luz, Gas, Internet)', value: 'Servicios' },
    { label: 'Transporte / Nafta', value: 'Transporte' },
    { label: 'Educación', value: 'Educación' },
    { label: 'Efectivo / Sueldo', value: 'Sueldo' },
    { label: 'Otros', value: 'Otros' }
];

const PAYMENT_METHODS = [
    'Efectivo',
    'Tarjeta Débito',
    'Tarjeta Crédito',
    'Mercado Pago',
    'Transferencia Bancaria'
];

const MovementModal = ({ isOpen, onClose, onSuccess }) => {
    const { addMovement } = useMovements();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'GASTO',
        amount: '',
        category: 'Alimentación',
        description: '',
        payment_method: 'Efectivo',
        date: new Date().toISOString().split('T')[0]
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addMovement({
                ...formData,
                amount: parseFloat(formData.amount)
            });

            Swal.fire({
                icon: 'success',
                title: '¡Registrado!',
                text: 'El movimiento se guardó correctamente.',
                timer: 1500,
                showConfirmButton: false,
                background: '#ffffff',
                color: '#1e293b'
            });

            onSuccess?.();
            onClose();
            // Reset form
            setFormData({
                type: 'GASTO',
                amount: '',
                category: 'Alimentación',
                description: '',
                payment_method: 'Efectivo',
                date: new Date().toISOString().split('T')[0]
            });
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

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1e293b] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-white/5 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">
                            Nuevo Movimiento
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-black tracking-[0.2rem] mt-2">
                            Registro de Finanzas
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Selector de Tipo */}
                    <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
                        {['INGRESO', 'GASTO', 'EMERGENCIA', 'AHORRO'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, type })}
                                className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.type === type
                                        ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {type === 'EMERGENCIA' ? '🚨 Emer.' : type === 'AHORRO' ? '💰 Ahorro' : type}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Monto */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-indigo-400 uppercase tracking-widest ml-1">Monto (ARS)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <DollarSign className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-black text-xl placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Fecha */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-indigo-400 uppercase tracking-widest ml-1">Fecha</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Calendar className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="date"
                                    required
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categoría */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-indigo-400 uppercase tracking-widest ml-1">Categoría</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Tag className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <select
                                className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none appearance-none"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.label} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-indigo-400 uppercase tracking-widest ml-1">Descripción / Detalle</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Type className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-bold text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                placeholder="Ejem: Supermercado Coto, Ferretería El Clavo..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Método de Pago */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-indigo-400 uppercase tracking-widest ml-1">Método de Pago</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <CreditCard className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <select
                                className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none appearance-none"
                                value={formData.payment_method}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                            >
                                {PAYMENT_METHODS.map(method => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black italic tracking-tight text-lg shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3 mt-4"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <span>Guardar Movimiento</span>
                                <Plus className="w-6 h-6" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MovementModal;
