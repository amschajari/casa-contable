import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const BarChartView = ({ monthlyData }) => {
    const { isDarkMode } = useTheme();

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumSignificantDigits: 3
        }).format(value);
    };

    return (
        <div className="bg-white dark:bg-white/5 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 p-8 h-[450px] transition-colors">
            <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">📊 Gráfico Anual</h3>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-black tracking-[0.25rem] mt-2">Ingresos Netos por Mes</p>
            </div>
            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}
                        />
                        <XAxis
                            dataKey="shortMonth"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontBold: 900 }}
                            dy={15}
                        />
                        <Tooltip
                            cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/5 backdrop-blur-xl">
                                            <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                                                {payload[0].payload.fullMonth}
                                            </p>
                                            <p className={`text-xl font-black ${payload[0].value >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {formatCurrency(payload[0].value)}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="total"
                            radius={[8, 8, 8, 8]}
                            barSize={32}
                        >
                            {monthlyData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.total >= 0 ? (isDarkMode ? '#6366f1' : '#4f46e5') : (isDarkMode ? '#f43f5e' : '#e11d48')}
                                    fillOpacity={entry.total === 0 ? 0.1 : 1}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BarChartView;
