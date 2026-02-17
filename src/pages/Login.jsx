import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: 'Accediendo a Casa Contable...',
                timer: 1500,
                showConfirmButton: false,
                background: '#ffffff',
                color: '#1e293b'
            });
            navigate('/admin/dashboard');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error de acceso',
                text: error.message || 'Credenciales inválidas',
                confirmButtonColor: '#4f46e5'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo / Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-500/20 mb-6 rotate-12 hover:rotate-0 transition-transform duration-500">
                        <LogIn className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2">Casa Contable</h1>
                    <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em]">Gestión Financiera Premium</p>
                </div>

                {/* Card */}
                <div className="bg-[#1e293b] rounded-[2.5rem] shadow-2xl border border-white/5 p-8 md:p-10 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Email Maestro</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-500 group-focus-within/input:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-12 pr-4 py-4 bg-[#0f172a]/50 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="admin@casacontable.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Password Especial</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-500 group-focus-within/input:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-12 pr-4 py-4 bg-[#0f172a]/50 border border-white/5 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
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
                                    <span>Verificando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Entrar al Sistema</span>
                                    <LogIn className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    Acceso Restringido • 2026 CLICANDO Ecosystem
                </p>
            </div>
        </div>
    );
};

export default Login;
