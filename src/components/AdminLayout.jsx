import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { Sun, Moon, LogOut, Home, History, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import MovementModal from './MovementModal';

const AdminLayout = ({ children }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const handleSuccess = () => {
        // Refresh page only if on dashboard or movements to update stats
        if (location.pathname.includes('dashboard') || location.pathname.includes('movements')) {
            window.location.reload();
        }
    };

    const getUserDisplayName = () => {
        const email = user?.email;
        if (email === 'a.m.saposnik@gmail.com') return 'ALE';
        if (email === 'silvinaeme@gmail.com') return 'SILVI';
        return email?.split('@')[0].toUpperCase();
    };

    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-main)] transition-colors duration-300">
            {/* Header / Navbar */}
            <nav className={`sticky top-0 z-[100] border-b transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/80 border-white/5 backdrop-blur-md' : 'bg-white/80 border-slate-200 backdrop-blur-md'
                }`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/admin/dashboard" className={`text-xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'
                            }`}>
                            Casa<span className="text-brand">Contable</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            <Link to="/admin/dashboard" className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive('/admin/dashboard')
                                ? 'bg-brand text-white shadow-lg shadow-brand/20'
                                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <Home className="w-3 h-3" /> Dashboard
                                </div>
                            </Link>
                            <Link to="/admin/movements" className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive('/admin/movements')
                                ? 'bg-brand text-white shadow-lg shadow-brand/20'
                                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <History className="w-3 h-3" /> Movimientos
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="hidden md:flex bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand/20 active:scale-95 items-center gap-2 mr-2"
                        >
                            <Plus className="w-4 h-4" /> Nuevo
                        </button>

                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-xl transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 text-yellow-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <div className="h-6 w-px bg-slate-200 dark:bg-white/5 mx-1 hidden md:block"></div>

                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-[10px] font-black text-brand dark:text-brand-dark uppercase tracking-widest leading-none">Usuario</span>
                            <span className={`text-sm font-black italic tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{getUserDisplayName()}</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <button
                                onClick={logout}
                                className={`p-2 rounded-xl transition-all active:scale-95 text-rose-500 hover:bg-rose-500/10`}
                                title="Cerrar Sesión"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                            <span className="text-[9px] font-black text-slate-400 md:hidden uppercase tracking-wider mt-1">{getUserDisplayName()}</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col pt-4">
                {children}
            </main>

            {/* FAB Mobile */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="md:hidden fixed bottom-24 right-6 z-[110] bg-brand text-white p-4 rounded-full shadow-2xl shadow-brand/40 active:scale-90 transition-transform flex items-center justify-center border-4 border-white dark:border-[#404040]"
            >
                <Plus className="w-8 h-8" />
            </button>

            {/* Mobile Nav */}
            <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[100] p-4 pb-8 transition-colors duration-300 ${isDarkMode ? 'bg-[#0f172a]/80 backdrop-blur-lg border-t border-white/5' : 'bg-white/80 backdrop-blur-lg border-t border-slate-200'
                }`}>
                <div className="flex justify-around items-center max-w-md mx-auto">
                    <Link to="/admin/dashboard" className={`p-4 rounded-2xl transition-all ${isActive('/admin/dashboard') ? 'bg-brand text-white shadow-xl shadow-brand/20' : 'text-slate-400 hover:text-brand'
                        }`}>
                        <Home className="w-6 h-6" />
                    </Link>
                    <div className="w-16"></div> {/* Espacio para el FAB */}
                    <Link to="/admin/movements" className={`p-4 rounded-2xl transition-all ${isActive('/admin/movements') ? 'bg-brand text-white shadow-xl shadow-brand/20' : 'text-slate-400 hover:text-brand'
                        }`}>
                        <History className="w-6 h-6" />
                    </Link>
                </div>
            </div>

            {/* Modal */}
            <MovementModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default AdminLayout;
