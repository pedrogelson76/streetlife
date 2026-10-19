import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, KeyRound, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

export const Register: React.FC = () => {
  const { signUp, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validação mínima e clara
    if (!email.trim() || !password) {
      setError('Por favor, informe e-mail e senha.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);

    const result = await signUp(email, password);

    if (result.success) {
      setSuccessMessage(
        result.message || 'Conta criada com sucesso! Redirecionando para login...'
      );
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.error || 'Erro ao realizar cadastro.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-white/5 via-slate-600/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="metallic-card w-full max-w-md rounded-2xl p-8 border border-white/15 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Logo size="md" />
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-display pt-2">
            Criar Conta
          </h1>
          <p className="text-xs text-gray-400">
            Junte-se à comunidade oficial STREETLIFE. Cadastro simples e direto.
          </p>
        </div>

        {!isConfigured && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <strong>Setup Pendente:</strong> Conecte sua URL e chave Anon do Supabase para salvar sua conta.
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 size={16} /> Cadastro Realizado!
            </div>
            <p className="leading-relaxed">{successMessage}</p>
          </div>
        )}

        {!successMessage && (
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
              <label className="block text-xs font-mono text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
                <KeyRound size={13} className="text-gray-400" /> Senha (mínimo 6 caracteres)
              </label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/30"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
                <KeyRound size={13} className="text-gray-400" /> Confirmar Senha
              </label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/30"
                required
                minLength={6}
              />
            </div>

            <div className="pt-2 text-[11px] text-gray-500 font-mono flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-gray-400 shrink-0" />
              <span>Privacidade garantida: não solicitamos CPF, telefone ou dados invasivos.</span>
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
                  <UserPlus size={14} /> Concluir Cadastro
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-white/10 text-center text-xs text-gray-400">
          <p>
            Já possui cadastro?{' '}
            <Link to="/login" className="text-white font-bold hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
