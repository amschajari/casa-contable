import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Download, Loader2, Calendar } from 'lucide-react';
import { useMovements } from '../hooks/useMovements';
import { movementsService } from '../services/movements';
import { useAuth } from '../hooks/useAuth';
import { parseMpCsv } from '../utils/mpCsvParser';
import Swal from 'sweetalert2';
import { formatCurrency } from '../utils/format';

const ImportMPModal = ({ isOpen, onClose, onSuccess }) => {
    const { importMovements } = useMovements();
    const { user } = useAuth();
    const [step, setStep] = useState('upload');
    const [lastDate, setLastDate] = useState(null);
    const [csvText, setCsvText] = useState('');
    const [parsed, setParsed] = useState([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setStep('upload');
        setCsvText('');
        setParsed([]);
        setLoading(true);
        movementsService.getLastMpDate().then(d => {
            setLastDate(d);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            setCsvText(text);
            const parsedData = parseMpCsv(text, user?.id);
            setParsed(parsedData);
            setStep('preview');
        };
        reader.readAsText(file);
    };

    const handlePaste = () => {
        if (!csvText.trim()) return;
        const parsedData = parseMpCsv(csvText, user?.id);
        setParsed(parsedData);
        setStep('preview');
    };

    const handleImport = async () => {
        setImporting(true);
        try {
            await importMovements(parsed);
            Swal.fire({
                icon: 'success',
                title: `¡${parsed.length} movimientos importados!`,
                timer: 2000,
                showConfirmButton: false
            });
            onSuccess?.();
            onClose();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al importar',
                text: error.message
            });
        } finally {
            setImporting(false);
        }
    };

    const totalAmount = parsed.reduce((sum, m) => sum + m.amount, 0);

    return (
        <div className="fixed inset-0 z-[200] flex justify-center items-start overflow-y-auto p-4 md:p-8 bg-slate-950/80 backdrop-blur-sm custom-scrollbar">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 my-auto">
                <div className="sticky top-0 z-10 p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter leading-none">
                            Importar Mercado Pago
                        </h3>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2rem] mt-2">
                            Cargar CSV desde actividad de MP
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-brand" />
                        </div>
                    ) : step === 'upload' ? (
                        <>
                            {lastDate && (
                                <div className="flex items-center gap-3 bg-brand-50 border border-brand/20 p-4 rounded-2xl">
                                    <Calendar className="w-5 h-5 text-brand shrink-0" />
                                    <p className="text-sm font-bold text-slate-700">
                                        Último gasto de MP registrado:{' '}
                                        <span className="font-black text-brand">{new Date(lastDate).toLocaleDateString('es-AR')}</span>
                                    </p>
                                </div>
                            )}

                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-brand/50 transition-colors">
                                <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="font-bold text-slate-600 mb-4">Seleccioná el CSV descargado de Mercado Pago</p>
                                <label className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-2xl font-black text-sm cursor-pointer hover:bg-brand-dark transition-all active:scale-95">
                                    <FileText className="w-5 h-5" />
                                    Elegir Archivo
                                    <input
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-4 text-xs font-black text-slate-400 uppercase tracking-widest">O pegar manualmente</span>
                                </div>
                            </div>

                            <textarea
                                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                                placeholder="Pegá el contenido del CSV aquí..."
                                value={csvText}
                                onChange={(e) => setCsvText(e.target.value)}
                            />
                            <button
                                onClick={handlePaste}
                                disabled={!csvText.trim()}
                                className="w-full bg-brand hover:bg-brand-dark text-white py-4 rounded-2xl font-black tracking-tight transition-all active:scale-95 disabled:opacity-50"
                            >
                                Previsualizar
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xl font-black text-slate-900 italic tracking-tighter">
                                        {parsed.length} movimientos detectados
                                    </p>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2rem] mt-1">
                                        Total: {formatCurrency(totalAmount)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setStep('upload')}
                                    className="text-sm font-bold text-brand hover:underline"
                                >
                                    Volver
                                </button>
                            </div>

                            <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2 border border-slate-100 rounded-2xl p-2">
                                {parsed.map((mov, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 px-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <span className="text-[9px] font-black text-slate-400 w-6 shrink-0">#{idx + 1}</span>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate">{mov.description}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                                                    {mov.category} • {new Date(mov.date).toLocaleDateString('es-AR')}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-black text-rose-600 text-base italic tracking-tighter shrink-0 ml-4">
                                            {formatCurrency(mov.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs font-bold text-amber-800">
                                    Revisá los datos antes de importar. Los movimientos se crearán con método de pago "Mercado Pago" y la categoría se asigna automáticamente.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('upload')}
                                    className="flex-1 border-2 border-slate-200 text-slate-600 py-4 rounded-2xl font-black tracking-tight hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={importing}
                                    className="flex-1 bg-brand hover:bg-brand-dark text-white py-4 rounded-2xl font-black tracking-tight transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {importing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Importar {parsed.length} movimientos
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportMPModal;
