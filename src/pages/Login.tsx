import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, KeyRound, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Por favor, informe seu e-mail e senha.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signIn(email, password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Credenciais inválidas. Verifique os dados digitados.');
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: window.location.origin + '/login',
      });
      if (error) {
        setError(error.message);
      } else {
        setResetSent(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar recuperação.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-white/5 via-slate-600/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="metallic-card w-full max-w-md rounded-2xl p-8 border border-white/15 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Logo size="md" />
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-display pt-2">
            Acessar Plataforma
          </h1>
          <p className="text-xs text-gray-400">
            Entre na sua conta para votar, enviar looks e participar das batalhas.
          </p>
        </div>

        {!isConfigured && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <strong>Atenção:</strong> As credenciais do Supabase ainda não foram configuradas. Você pode configurar pelo botão <strong>Setup</strong> no topo da página.
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
              <Mail size={13} className="text-gray-400" /> E-mail
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/30"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-gray-300 uppercase flex items-center gap-1.5">
                <KeyRound size={13} className="text-gray-400" /> Senha
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowResetModal(true);
                }}
                className="text-[11px] text-gray-400 hover:text-white transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/30"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-chrome py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={14} /> Entrar na STREETLIFE
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center text-xs text-gray-400 space-y-2">
          <p>
            Não tem uma conta ainda?{' '}
            <Link to="/cadastro" className="text-white font-bold hover:underline">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>

      {/* Modal de Recuperação de Senha */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="metallic-card w-full max-w-sm rounded-2xl p-6 border border-white/20 space-y-4">
            <h3 className="text-lg font-bold text-white uppercase">Recuperação de Senha</h3>
            <p className="text-xs text-gray-400">
              Informe seu e-mail cadastrado para enviarmos um link de redefinição de senha.
            </p>

            {resetSent ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs">
                E-mail de recuperação enviado! Verifique sua caixa de entrada.
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-3">
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full btn-chrome py-2 rounded-xl text-xs font-bold uppercase"
                >
                  {resetLoading ? 'Enviando...' : 'Enviar Link de Redefinição'}
                </button>
              </form>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetSent(false);
                }}
                className="text-xs text-gray-400 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
