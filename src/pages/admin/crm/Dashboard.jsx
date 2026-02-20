import React, { useEffect, useState } from 'react';
import { movementsService } from '../../../services/movements';
import { Link } from 'react-router-dom';
import BarChartView from '../../../components/BarChartView';
import { Wallet, TrendingUp, TrendingDown, Clock, ChevronRight, AlertCircle, Info, CheckCircle } from 'lucide-react';

// Hook para obtener resumen por mes para el gráfico
const useMonthlySummary = ({ selectedYear }) => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función auxiliar para obtener año y mes de fecha YYYY-MM-DD sin problemas de timezone
    const getDateParts = (dateString) => {
        if (!dateString) return { year: null, month: null };
        const [year, month] = dateString.split('-').map(Number);
        return { year, month: month - 1 }; // month 0-indexed
    };

    useEffect(() => {
        const fetchMonthlyData = async () => {
            try {
                const data = await movementsService.getAll();

                // Filtrar por año y agrupar por mes (sin problemas de timezone)
                const filtered = data.filter(m => getDateParts(m.date).year === selectedYear);

                const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const monthlyTotals = Array(12).fill(0);

                filtered.forEach(m => {
                    const { month } = getDateParts(m.date);
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
            label: <span>Fondo <span className="text-base ml-1">🚨</span></span>,
            color: 'amber'
        },
        {
            title: 'Ahorro',
            value: summary.totalSavings || 0,
            icon: <Wallet className="w-8 h-8 text-brand" />,
            label: <span>Metas <span className="text-base ml-1">💰</span></span>,
            color: 'brand'
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
                <div key={index} className="premium-card p-8 flex items-center justify-between group hover:border-brand/50 transition-all hover:-translate-y-1">
                    <div>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-[0.2rem] font-black mb-2 opacity-80">{card.label}</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-slate-800 tracking-tighter italic">
                            {formatCurrency(card.value)}
                        </p>
                        <p className="text-slate-500 dark:text-slate-600 text-[10px] font-black mt-2 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{card.title}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-200/50 rounded-2xl group-hover:scale-110 transition-transform shadow-inner border border-transparent dark:border-slate-300/50">
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
        <div className="premium-card overflow-hidden flex flex-col">
            <div className="p-8 bg-slate-50/50 dark:bg-slate-50 border-b border-slate-100 dark:border-slate-200 flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter">Últimos Movimientos</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-[0.2rem] mt-1">Actividad Reciente</p>
                </div>
                <Link
                    to="/admin/movements"
                    className="bg-brand text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark shadow-lg shadow-brand/20 transition-all active:scale-95 flex items-center gap-2"
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
                            <div key={mov.id} className={`flex justify-between items-center p-4 px-6 bg-slate-50 dark:bg-slate-100 rounded-[1.5rem] border transition-all group ${mov.status === 'PENDING'
                                ? 'border-dashed border-amber-300 dark:border-amber-400/50 opacity-80'
                                : 'border-transparent hover:border-brand/30 dark:hover:border-brand/40'
                                }`}>
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0 ${mov.status === 'PENDING'
                                                ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-dashed border-amber-300'
                                                : mov.type === 'INGRESO'
                                                    ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : mov.type === 'GASTO'
                                                        ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                        : mov.type === 'EMERGENCIA'
                                                            ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                            : mov.type === 'AHORRO'
                                                                ? 'bg-brand-100 dark:bg-brand-200 text-brand dark:text-brand-dark'
                                                                : 'bg-slate-100 dark:bg-slate-200 text-slate-600 dark:text-slate-700'
                                                }`}>
                                                {mov.status === 'PENDING' ? 'PENDIENTE' : mov.type}
                                            </span>
                                            <p className="font-black text-slate-800 italic text-base md:text-lg tracking-tight leading-none truncate">{mov.description || 'Sin descripción'}</p>
                                            <div className={`w-6 h-6 flex items-center justify-center rounded-full border text-[10px] font-black transition-all shrink-0 ${mov.user_id === '18d11914-7b1a-4ff0-a121-a5f0fd668026'
                                                ? 'bg-pink-50 dark:bg-pink-500/10 text-pink-500 border-pink-200/50'
                                                : 'bg-brand-50 dark:bg-brand-500/10 text-brand border-brand-200/50'
                                                }`}>
                                                {mov.user_id === '18d11914-7b1a-4ff0-a121-a5f0fd668026' ? 'S' : 'A'}
                                            </div>
                                            {mov.total_installments > 1 && (
                                                <span className="bg-brand-100/50 dark:bg-brand-200 text-brand dark:text-brand-dark text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shrink-0">
                                                    {mov.installment_number}/{mov.total_installments}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.2rem]">
                                            {mov.date.split('-').reverse().join('/')} • {new Date(mov.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className={`text-lg md:text-xl font-black tracking-tighter italic ${mov.type === 'INGRESO' ? 'text-emerald-600 dark:text-emerald-400' :
                                            mov.type === 'GASTO' ? 'text-rose-600 dark:text-rose-400' :
                                                mov.type === 'EMERGENCIA' ? 'text-amber-600 dark:text-amber-400' :
                                                    mov.type === 'AHORRO' ? 'text-brand' :
                                                        'text-slate-600 dark:text-slate-400'
                                            }`}>
                                            {mov.type === 'GASTO' ? '-' : ''}{formatCurrency(mov.amount)}
                                        </p>
                                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-[0.1rem] opacity-60">{mov.category}</p>
                                    </div>
                                    {mov.status === 'PENDING' && (
                                        <button
                                            onClick={async () => {
                                                await movementsService.confirm(mov.id);
                                                window.location.reload();
                                            }}
                                            className="p-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                    )}
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
                    <div className="h-2 w-24 bg-brand mt-2 rounded-full"></div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-100 p-2 px-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-300 transition-colors">
                    <Clock className="w-4 h-4 text-brand" />
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="text-xs font-black uppercase text-slate-900 focus:outline-none bg-transparent cursor-pointer"
                    >
                        {[2024, 2025, 2026].map(year => (
                            <option key={year} value={year} className="dark:bg-white">{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <SummaryCards />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {chartLoading ? (
                        <div className="h-[450px] bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] animate-pulse h-[450px]"></div>
                    ) : (
                        <BarChartView monthlyData={monthlyData} />
                    )}
                    <RecentMovements />
                </div>

                <div className="space-y-6">
                    <div className="bg-brand p-8 rounded-2xl shadow-2xl text-white relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 text-9xl opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-500">🏠</div>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/70 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> Estado del Hogar
                        </h4>
                        <p className="text-xl font-black italic tracking-tight leading-snug">Control Total</p>
                        <p className="text-sm text-white/90 mt-4 leading-relaxed">
                            Recuerda registrar cada gasto para mantener un balance preciso del hogar.
                        </p>
                        <div className="mt-8 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Sincronizado con Supabase</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-100 border border-slate-100 dark:border-slate-300 p-6 rounded-2xl flex gap-4 transition-colors">
                        <Info className="w-6 h-6 text-brand shrink-0" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-1">Dato Útil</p>
                            <p className="text-xs text-slate-800 dark:text-slate-900 font-medium leading-relaxed">
                                Los consumos no afectan el balance directo pero ayudan a trackear el uso de recursos.
                            </p>
                        </div>
                    </div>

                    <PersonalSummary />
                </div>
            </div>
        </div>
    );
};

const PersonalSummary = () => {
    const [stats, setStats] = useState({
        ale: { income: 0, expenses: 0 },
        silvi: { income: 0, expenses: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await movementsService.getAll();
                const silviId = '18d11914-7b1a-4ff0-a121-a5f0fd668026';
                const aleId = 'e8e1a9ee-8a3d-4e8a-b12f-aed264d54d7b';

                const newStats = data.reduce((acc, m) => {
                    if (m.status !== 'CONFIRMED') return acc;

                    const isSilvi = m.user_id === silviId;
                    const target = isSilvi ? acc.silvi : acc.ale;

                    if (m.type === 'INGRESO') target.income += Number(m.amount);
                    if (m.type === 'GASTO' || m.type === 'EMERGENCIA' || m.type === 'AHORRO') target.expenses += Number(m.amount);

                    return acc;
                }, {
                    ale: { income: 0, expenses: 0 },
                    silvi: { income: 0, expenses: 0 }
                });

                setStats(newStats);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) return (
        <div className="animate-pulse space-y-4">
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
        </div>
    );

    return (
        <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 ml-1">Resumen Personal</h4>

            {/* ALE */}
            <div className="bg-white dark:bg-slate-100 border border-slate-100 dark:border-slate-300 p-6 rounded-2xl shadow-sm group hover:border-brand/40 transition-colors">
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-black text-xs shadow-lg shadow-brand/20">A</div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-900">ALE</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ingresos</p>
                        <p className="text-xl font-black text-emerald-600 italic tracking-tighter leading-none">{formatCurrency(stats.ale.income)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Salidas</p>
                        <p className="text-xl font-black text-rose-600 italic tracking-tighter leading-none">{formatCurrency(stats.ale.expenses)}</p>
                    </div>
                </div>
            </div>

            {/* SILVI */}
            <div className="bg-white dark:bg-slate-100 border border-slate-100 dark:border-slate-300 p-6 rounded-2xl shadow-sm group hover:border-pink-300/40 transition-colors">
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-pink-500/20">S</div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-900">SILVI</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ingresos</p>
                        <p className="text-xl font-black text-emerald-600 italic tracking-tighter leading-none">{formatCurrency(stats.silvi.income)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Salidas</p>
                        <p className="text-xl font-black text-rose-600 italic tracking-tighter leading-none">{formatCurrency(stats.silvi.expenses)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
