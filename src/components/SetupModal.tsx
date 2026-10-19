import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Copy, Check, ExternalLink, KeyRound, Database, RefreshCw, X } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from '../lib/supabase';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose }) => {
  const config = getSupabaseConfig();
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      alert('Por favor, informe tanto a URL quanto a chave Anon.');
      return;
    }
    saveSupabaseConfig(url, anonKey);
  };

  const copySchemaPath = () => {
    navigator.clipboard.writeText('supabase/schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl metallic-card p-6 rounded-2xl border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl border ${config.isConfigured ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
            {config.isConfigured ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Configuração Supabase
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${config.isConfigured ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {config.isConfigured ? 'Conectado' : 'Aguardando Credenciais'}
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              {config.isConfigured ? 'O STREETLIFE está operando com seu Supabase real.' : 'Conecte seu projeto para autenticação e persistência de dados em tempo real.'}
            </p>
          </div>
        </div>

        {/* Passo a Passo */}
        <div className="space-y-4 mb-6">
          <div className="bg-obsidian-900 border border-white/5 rounded-xl p-4 text-xs space-y-2">
            <div className="font-semibold text-gray-200 flex items-center gap-2">
              <Database size={14} className="text-sky-400" />
              1. Executar o Esquema SQL no Supabase:
            </div>
            <p className="text-gray-400">
              No painel do seu projeto Supabase, acesse o <strong>SQL Editor</strong> e execute o script contido em:
            </p>
            <div className="flex items-center justify-between bg-black/60 px-3 py-2 rounded-lg border border-white/10 font-mono text-gray-300">
              <span>supabase/schema.sql</span>
              <button
                onClick={copySchemaPath}
                className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copiado!' : 'Copiar caminho'}
              </button>
            </div>
          </div>

          <div className="bg-obsidian-900 border border-white/5 rounded-xl p-4 text-xs space-y-2">
            <div className="font-semibold text-gray-200 flex items-center gap-2">
              <KeyRound size={14} className="text-sky-400" />
              2. Obter URL e Anon Key do Supabase:
            </div>
            <p className="text-gray-400">
              No Supabase, vá em <strong>Project Settings → API</strong>. Copie o <strong>Project URL</strong> e a <strong>anon public key</strong>.
            </p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sky-400 hover:underline pt-1"
            >
              Abrir Supabase Dashboard <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Formulário de Configuração Rápida */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              VITE_SUPABASE_URL
            </label>
            <input
              type="url"
              placeholder="https://exemplo-id.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/30"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              VITE_SUPABASE_ANON_KEY (Public Key)
            </label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/30 font-mono"
              required
            />
            <p className="text-[11px] text-gray-500 mt-1">
              * Nunca utilize a service_role key. Use apenas a anon public key.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            {config.isConfigured ? (
              <button
                type="button"
                onClick={clearSupabaseConfig}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                Remover credenciais locais
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white transition-colors"
              >
                Fechar
              </button>
              <button
                type="submit"
                className="btn-chrome px-5 py-2 rounded-xl text-xs flex items-center gap-1.5"
              >
                <RefreshCw size={12} /> Salvar & Conectar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
