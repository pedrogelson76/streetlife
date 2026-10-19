import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Logo } from './Logo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro interceptado pelo ErrorBoundary:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050507] text-[#f8fafc] flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="metallic-card max-w-lg w-full p-8 rounded-2xl border border-white/20 shadow-2xl space-y-6">
            <Logo size="md" />

            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold uppercase text-white font-display">
                Algo inesperado aconteceu
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                A aplicação encontrou uma falha temporária ao renderizar este módulo.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-left overflow-x-auto">
                <p className="text-[11px] font-mono text-rose-300">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="btn-metallic px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold"
              >
                Voltar ao Início
              </button>
              <button
                onClick={this.handleReload}
                className="btn-chrome px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-1.5"
              >
                <RefreshCw size={14} /> Recarregar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
