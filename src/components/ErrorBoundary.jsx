import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-100 rounded-full mb-6">
                            <AlertCircle className="w-10 h-10 text-rose-500" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 mb-2">Algo salió mal</h1>
                        <p className="text-slate-500 mb-6">
                            Ocurrió un error inesperado. Por favor, intenta nuevamente.
                        </p>
                        <button
                            onClick={this.handleRetry}
                            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Intentar de nuevo
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
