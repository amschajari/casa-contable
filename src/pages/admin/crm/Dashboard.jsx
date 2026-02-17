import React, { useEffect, useState } from 'react';
import { movementsService } from '../../../services/movements';
import { Link } from 'react-router-dom';
import BarChartView from '../../../components/BarChartView';
import { Wallet, TrendingUp, TrendingDown, Clock, ChevronRight, AlertCircle, Info } from 'lucide-react';

// Hook para obtener resumen por mes para el gráfico
const useMonthlySummary = ({ selectedYear }) => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMonthlyData = async () => {
            try {
                const data = await movementsService.getAll();

                // Filtrar por año y agrupar por mes
                const filtered = data.filter(m => new Date(m.date).getFullYear() === selectedYear);

                const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const monthlyTotals = Array(12).fill(0);

                filtered.forEach(m => {
                    const month = new Date(m.date).getMonth();
                    if (m.type === 'INGRESO') monthlyTotals[month] += Number(m.amount);
                    if (m.type === 'GASTO') monthlyTotals[month] -= Number(m.amount);
                });

                const formattedData = monthlyTotals.map((total, index) => ({
                    month: months[index],
                    shortMonth: months[index],
                    fullMonth: months[index],
                    total,
                    monthIndex: index + 1
                }));

                setMonthlyData(formattedData);
            } catch (err) {
                console.error('Error fetching monthly data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyData();
    }, [selectedYear]);

    return { monthlyData, loading, error };
};

const SummaryCards = () => {
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await movementsService.getSummary();
                setSummary(data);
            } catch (err) {
                console.error('Error fetching summary:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const cards = [
        {
            title: 'Ingresos',
            value: summary.totalIncome,
            icon: <TrendingUp className="w-8 h-8 text-emerald-500" />,
            label: 'Entradas',
            color: 'emerald'
        },
        {
            title: 'Gastos',
            value: summary.totalExpenses,
            icon: <TrendingDown className="w-8 h-8 text-rose-500" />,
            label: 'Salidas',
            color: 'rose'
        },
        {
            title: 'Emergencia',
            value: summary.totalEmergency || 0,
            icon: <AlertCircle className="w-8 h-8 text-amber-500" />,
            label: 'Fondo 🚨',
            color: 'amber'
        },
        {
            title: 'Ahorro',
            value: summary.totalSavings || 0,
            icon: <Wallet className="w-8 h-8 text-indigo-500" />,
            label: 'Metas 💰',
            color: 'indigo'
        },
        {
            title: 'Balance',
            value: summary.balance,
            icon: <div className="text-2xl font-black italic">$=</div>,
            label: 'Disponible',
            color: 'slate'
        },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>)}
    </div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {cards.map((card, index) => (
                <div key={index} className="bg-white dark:bg-white/5 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all hover:-translate-y-1">
                    <div>
                        <p className="text-slate-400 dark:text-gray-500 text-[10px] uppercase tracking-[0.2rem] font-black mb-2 opacity-80">{card.label}</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                            {formatCurrency(card.value)}
                        </p>
                        <p className="text-slate-500 dark:text-gray-400 text-[10px] font-black mt-2 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{card.title}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl group-hover:scale-110 transition-transform shadow-inner">
                        {card.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};

const RecentMovements = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const data = await movementsService.getAll();
                setMovements(data.slice(0, 5));
            } catch (err) {
                console.error('Error fetching recent:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="bg-white dark:bg-white/5 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 overflow-hidden flex flex-col">
            <div className="p-8 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">Últimos Movimientos</h3>
                    <p className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-black tracking-[0.2rem] mt-1">Actividad Reciente</p>
                </div>
                <Link
                    to="/admin/movements"
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
                >
                    Ver Todo <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="p-8">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>)}
                    </div>
                ) : movements.length === 0 ? (
                    <p className="p-10 text-center text-gray-300 italic font-medium">No hay movimientos registrados.</p>
                ) : (
                    <div className="space-y-4">
                        {movements.map((mov) => (
                            <div key={mov.id} className="flex justify-between items-center p-4 px-6 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-white dark:hover:bg-indigo-500/5 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${mov.type === 'INGRESO' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                            mov.type === 'GASTO' ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                                                mov.type === 'EMERGENCIA' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                                    mov.type === 'AHORRO' ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                                                        'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                                        } shadow-inner`}>
                                        {mov.type === 'INGRESO' ? '+' : mov.type === 'GASTO' ? '-' : mov.type === 'EMERGENCIA' ? '!' : '*'}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 dark:text-white italic text-lg tracking-tight leading-none mb-1">{mov.description || 'Sin descripción'}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.2rem]">{mov.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xl font-black tracking-tighter italic ${mov.type === 'INGRESO' ? 'text-emerald-600 dark:text-emerald-400' :
                                        mov.type === 'GASTO' ? 'text-rose-600 dark:text-rose-400' :
                                            mov.type === 'EMERGENCIA' ? 'text-amber-600 dark:text-amber-400' :
                                                mov.type === 'AHORRO' ? 'text-indigo-600 dark:text-indigo-400' :
                                                    'text-slate-600 dark:text-slate-400'
                                        }`}>
                                        {formatCurrency(mov.amount)}
                                    </p>
                                    <p className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.1rem] opacity-60">{mov.category}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const { monthlyData, loading: chartLoading } = useMonthlySummary({ selectedYear });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col flex-1 w-full bg-transparent">
            {/* Header Simplified (Title in AdminLayout) */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">
                        Dashboard
                    </h1>
                    <div className="h-2 w-24 bg-indigo-600/20 dark:bg-indigo-600/40 rounded-full mt-2"></div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-2 px-4 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 focus:outline-none bg-transparent cursor-pointer"
                    >
                        {[2024, 2025, 2026].map(year => (
                            <option key={year} value={year} className="dark:bg-slate-800">{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <SummaryCards />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {chartLoading ? (
                        <div className="h-[400px] bg-gray-100 rounded-2xl animate-pulse"></div>
                    ) : (
                        <BarChartView monthlyData={monthlyData} />
                    )}
                    <RecentMovements />
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-2xl shadow-2xl text-white relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 text-9xl opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-500">🏠</div>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-300 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> Estado del Hogar
                        </h4>
                        <p className="text-xl font-black italic tracking-tight leading-snug">Control Total</p>
                        <p className="text-sm text-indigo-100/80 mt-4 leading-relaxed">
                            Recuerda registrar cada gasto para mantener un balance preciso del hogar.
                        </p>
                        <div className="mt-8 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Sincronizado con Supabase</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-6 rounded-2xl flex gap-4">
                        <Info className="w-6 h-6 text-indigo-500 shrink-0" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">Dato Útil</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                Los consumos no afectan el balance directo pero ayudan a trackear el uso de recursos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
