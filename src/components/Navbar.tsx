import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Swords, 
  Sparkles, 
  Users, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  Database,
  Crown
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { SetupModal } from './SetupModal';

export const Navbar: React.FC = () => {
  const { user, isAdmin, signOut, isConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Batalhas', path: '/batalhas', icon: Swords },
    { name: 'Campeões', path: '/campeoes', icon: Trophy },
    { name: 'Look da Semana', path: '/look-da-semana', icon: Sparkles },
    { name: 'Comunidade', path: '/comunidade', icon: Users },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-obsidian-950/85 backdrop-blur-xl">
        {/* Banner discreto de status Supabase caso não configurado */}
        {!isConfigured && (
          <div className="bg-gradient-to-r from-amber-950/70 via-obsidian-900 to-amber-950/70 border-b border-amber-500/20 px-4 py-1.5 text-center text-xs flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-amber-200">Supabase não conectado: configure suas chaves para habilitar persistência e autenticação.</span>
            <button
              onClick={() => setSetupModalOpen(true)}
              className="text-white underline font-semibold hover:text-amber-300 ml-1"
            >
              Conectar agora
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <Logo size="md" />
            </Link>

            {/* Links Desktop */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                      active
                        ? 'text-white bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                    }`}
                  >
                    {link.icon && <link.icon size={14} className={active ? 'text-white' : 'text-gray-400'} />}
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Ações / Autenticação Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Botão de Status Supabase */}
              <button
                onClick={() => setSetupModalOpen(true)}
                title="Configuração do Banco Supabase"
                className={`p-2 rounded-lg border transition-all text-xs flex items-center gap-1.5 ${
                  isConfigured 
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                }`}
              >
                <Database size={14} />
                <span className="hidden xl:inline text-[11px] font-mono">
                  {isConfigured ? 'Supabase OK' : 'Setup'}
                </span>
              </button>

              {user ? (
                <div className="flex items-center gap-2.5">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    >
                      <Crown size={14} className="text-amber-400" />
                      Painel Admin
                    </Link>
                  )}

                  <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                    <div className="text-right">
                      <div className="text-xs font-medium text-white max-w-[130px] truncate">
                        {user.email?.split('@')[0]}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {isAdmin ? 'Administrador' : 'Membro'}
                      </div>
                    </div>

                    <button
                      onClick={handleSignOut}
                      title="Encerrar Sessão"
                      className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LogOut size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
                  >
                    <LogIn size={14} />
                    Login
                  </Link>

                  <Link
                    to="/cadastro"
                    className="btn-chrome px-4 py-2 rounded-lg text-xs flex items-center gap-1.5"
                  >
                    Cadastro
                  </Link>
                </div>
              )}
            </div>

            {/* Botão Mobile Menu */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setSetupModalOpen(true)}
                className={`p-2 rounded-lg border ${
                  isConfigured 
                    ? 'border-emerald-500/30 text-emerald-400' 
                    : 'border-amber-500/30 text-amber-400'
                }`}
              >
                <Database size={16} />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-obsidian-950 px-4 pt-4 pb-6 space-y-3">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3.5 py-2.5 rounded-lg text-sm font-medium uppercase tracking-wider flex items-center gap-2.5 ${
                      active
                        ? 'text-white bg-white/10 border border-white/20'
                        : 'text-gray-400 hover:text-gray-100'
                    }`}
                  >
                    {link.icon && <link.icon size={16} />}
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-white/10 space-y-2">
              {user ? (
                <>
                  <div className="px-3.5 py-2 text-xs text-gray-400">
                    Conectado como: <strong className="text-white">{user.email}</strong>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-2 justify-center"
                    >
                      <Crown size={16} /> Painel Administrativo
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm font-medium border border-white/10 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 justify-center"
                  >
                    <LogOut size={16} /> Encerrar Sessão
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-metallic text-center py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/cadastro"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-chrome text-center py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold"
                  >
                    Cadastro
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modal de Configuração Supabase */}
      <SetupModal isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} />
    </>
  );
};
