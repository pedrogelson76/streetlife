import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Flame, Shield, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-obsidian-950 pt-16 pb-12 mt-20 relative overflow-hidden">
      {/* Luz ambiente sutil no rodapé */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-white/5 to-transparent blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Coluna 1: Identidade */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" showSubtitle />
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md pt-2">
              A plataforma definitiva de batalhas de looks da cultura streetwear e sportlife.
              Consagrando autenticidade, curadoria independente e os melhores encaixes da cena urbana.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-gray-500 font-mono">
              <span className="flex items-center gap-1">
                <Flame size={12} className="text-white" /> Estética Underground
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield size={12} className="text-white" /> RLS Security
              </span>
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 font-mono">
              Plataforma
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/batalhas" className="hover:text-white transition-colors">
                  Batalhas & Edições
                </Link>
              </li>
              <li>
                <Link to="/campeoes" className="hover:text-white transition-colors">
                  Quadro de Campeões
                </Link>
              </li>
              <li>
                <Link to="/look-da-semana" className="hover:text-white transition-colors">
                  Look da Semana
                </Link>
              </li>
              <li>
                <Link to="/comunidade" className="hover:text-white transition-colors">
                  Membros & Galeria
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Acesso & Administrador */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 font-mono">
              Acesso
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Entrar na Conta
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="hover:text-white transition-colors">
                  Criar Conta
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-400 transition-colors flex items-center gap-1 text-gray-400">
                  Painel de Controle <ArrowUpRight size={12} />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Rodapé inferior */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} STREETLIFE. Todos os direitos reservados.</p>
          <p className="font-mono text-[11px]">
            Desenvolvido com React, TypeScript & Supabase
          </p>
        </div>
      </div>
    </footer>
  );
};
