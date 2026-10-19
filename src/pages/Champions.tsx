import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Sparkles, 
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { resultsService } from '../services/api';
import type { Battle, BattleResult } from '../types';
import { useAuth } from '../context/AuthContext';

export const Champions: React.FC = () => {
  const { isConfigured, isAdmin } = useAuth();
  const [history, setHistory] = useState<{ battle: Battle; results: BattleResult[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEditionIndex, setSelectedEditionIndex] = useState(0);

  useEffect(() => {
    const loadResults = async () => {
      if (!isConfigured) {
        setLoading(false);
        return;
      }
      try {
        const data = await resultsService.getAllWithBattles();
        setHistory(data);
      } catch (err) {
        console.error('Erro ao carregar campeões:', err);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [isConfigured]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#fbbf24', '#d4af37', '#e2e8f0'],
    });
  };

  const currentSelection = history[selectedEditionIndex] || null;
  const firstPlace = currentSelection?.results?.find((r) => r.placement === 1);
  const secondPlace = currentSelection?.results?.find((r) => r.placement === 2);
  const thirdPlace = currentSelection?.results?.find((r) => r.placement === 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Cabeçalho */}
      <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-amber-400">
            <Crown size={14} /> Hall da Fama Streetlife
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-display">
            Quadro de Campeões
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
            A consagração dos vencedores de cada batalha temática. Os melhores looks, styling impecável e o pódio oficial da comunidade.
          </p>
        </div>

        {/* Seletor de Edição */}
        {history.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400 uppercase">Selecionar Edição:</span>
            <select
              value={selectedEditionIndex}
              onChange={(e) => {
                setSelectedEditionIndex(Number(e.target.value));
                triggerCelebration();
              }}
              className="bg-obsidian-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
            >
              {history.map((item, idx) => (
                <option key={item.battle.id} value={idx}>
                  ED. #{String(item.battle.edition_number).padStart(2, '0')} — {item.battle.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400 font-mono">Carregando pódio histórico...</p>
        </div>
      ) : currentSelection ? (
        <div className="space-y-12">
          {/* Informações da Edição Selecionada */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-mono text-xs font-bold">
                EDIÇÃO #{String(currentSelection.battle.edition_number).padStart(2, '0')}
              </span>
              <div>
                <h2 className="text-xl font-bold text-white uppercase">
                  {currentSelection.battle.title}
                </h2>
                <span className="text-xs font-mono text-gray-400">
                  Tema: {currentSelection.battle.theme}
                </span>
              </div>
            </div>

            <button
              onClick={triggerCelebration}
              className="btn-metallic px-3.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 text-amber-300 hover:text-amber-200"
            >
              <Sparkles size={14} /> Soltar Confetes
            </button>
          </div>

          {/* ===================================================================== */}
          {/* O PÓDIO: 1º LUGAR (CENTRO/DESTAQUE), 2º LUGAR, 3º LUGAR */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            {/* 2º LUGAR (VICE-CAMPEÃO) */}
            <div className="lg:col-span-4 order-2 lg:order-1">
              {secondPlace ? (
                <div className="metallic-card rounded-2xl p-6 border border-slate-400/30 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-300 text-slate-900 flex items-center gap-1 shadow-sm">
                      <Medal size={14} /> 2º LUGAR (PRATA)
                    </span>
                    <span className="text-xs font-mono text-gray-400">VICE-CAMPEÃO</span>
                  </div>

                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-obsidian-900 border border-white/10 group">
                    <img
                      src={secondPlace.look_image_url}
                      alt={secondPlace.look_title || 'Look 2º Lugar'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-mono text-gray-400">
                      @{secondPlace.participant_name}
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase truncate">
                      {secondPlace.look_title || 'Look Destaque Prata'}
                    </h3>
                    {secondPlace.custom_notes && (
                      <p className="text-xs text-gray-400 italic">
                        "{secondPlace.custom_notes}"
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="metallic-card rounded-2xl p-8 text-center border border-dashed border-white/10 text-xs text-gray-500">
                  2º lugar não registrado para esta edição.
                </div>
              )}
            </div>

            {/* 1º LUGAR (CAMPEÃO SUPREMO — DESTAQUE VISUAL PREMIUM) */}
            <div className="lg:col-span-4 order-1 lg:order-2">
              {firstPlace ? (
                <div className="metallic-card-champion rounded-2xl p-6 md:p-7 border-2 border-amber-400/60 shadow-[0_0_50px_rgba(234,179,8,0.25)] flex flex-col space-y-5 relative">
                  {/* Coroa orbital sobreposta */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 p-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black shadow-lg">
                    <Crown size={24} />
                  </div>

                  <div className="text-center pt-2">
                    <span className="inline-block px-4 py-1 rounded-full text-xs font-mono font-black uppercase tracking-widest bg-amber-400 text-black shadow-md">
                      ★ 1º LUGAR — CAMPEÃO SUPREMO ★
                    </span>
                  </div>

                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-obsidian-900 border-2 border-amber-400/40 group shadow-2xl">
                    <img
                      src={firstPlace.look_image_url}
                      alt={firstPlace.look_title || 'Look Campeão'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40" />
                  </div>

                  <div className="text-center space-y-1.5">
                    <div className="text-xs font-mono text-amber-300 font-semibold tracking-wider uppercase">
                      @{firstPlace.participant_name}
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                      {firstPlace.look_title || 'Look Campeão Oficial'}
                    </h3>
                    {firstPlace.custom_notes && (
                      <p className="text-xs text-amber-200/80 italic max-w-xs mx-auto">
                        "{firstPlace.custom_notes}"
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="metallic-card-champion rounded-2xl p-10 text-center border border-dashed border-amber-500/20 text-xs text-amber-400/60">
                  1º lugar não registrado para esta edição.
                </div>
              )}
            </div>

            {/* 3º LUGAR (BRONZE) */}
            <div className="lg:col-span-4 order-3">
              {thirdPlace ? (
                <div className="metallic-card rounded-2xl p-6 border border-amber-800/40 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-800 text-amber-100 flex items-center gap-1 shadow-sm">
                      <Medal size={14} /> 3º LUGAR (BRONZE)
                    </span>
                    <span className="text-xs font-mono text-gray-400">PÓDIO BRONZE</span>
                  </div>

                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-obsidian-900 border border-white/10 group">
                    <img
                      src={thirdPlace.look_image_url}
                      alt={thirdPlace.look_title || 'Look 3º Lugar'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-mono text-gray-400">
                      @{thirdPlace.participant_name}
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase truncate">
                      {thirdPlace.look_title || 'Look Destaque Bronze'}
                    </h3>
                    {thirdPlace.custom_notes && (
                      <p className="text-xs text-gray-400 italic">
                        "{thirdPlace.custom_notes}"
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="metallic-card rounded-2xl p-8 text-center border border-dashed border-white/10 text-xs text-gray-500">
                  3º lugar não registrado para esta edição.
                </div>
              )}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* HISTÓRICO DE EDIÇÕES ANTERIORES */}
          {/* ===================================================================== */}
          {history.length > 1 && (
            <div className="pt-12 border-t border-white/10 space-y-6">
              <h3 className="text-xl font-bold text-white uppercase flex items-center gap-2">
                <Layers size={18} className="text-gray-400" />
                Histórico de Outras Edições
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {history.map((item, idx) => {
                  const champ = item.results.find((r) => r.placement === 1);
                  return (
                    <div
                      key={item.battle.id}
                      onClick={() => {
                        setSelectedEditionIndex(idx);
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                      }}
                      className={`metallic-card p-5 rounded-xl cursor-pointer border transition-all ${
                        selectedEditionIndex === idx
                          ? 'border-amber-400 bg-amber-500/5'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-2">
                        <span>ED. #{String(item.battle.edition_number).padStart(2, '0')}</span>
                        {selectedEditionIndex === idx && (
                          <span className="text-amber-400 font-bold">Visualizando</span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase truncate">
                        {item.battle.title}
                      </h4>
                      {champ && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-300">
                          <Crown size={12} className="text-amber-400" />
                          <span>Campeão: <strong>@{champ.participant_name}</strong></span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Estado Vazio Convidando Admin a Cadastrar Primeira Edição */
        <div className="metallic-card rounded-2xl p-14 text-center border border-dashed border-white/15 space-y-4 max-w-xl mx-auto">
          <Trophy size={48} className="mx-auto text-amber-500/60" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white uppercase">
              Nenhum Pódio Registrado Ainda
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              O Quadro de Campeões aguarda o encerramento da primeira batalha temática. 
              {isAdmin 
                ? ' Como administrador, você pode cadastrar as edições e os vencedores no Painel Administrativo.' 
                : ' Fique atento às batalhas em andamento e acompanhe a consagração dos novos campeões.'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              to="/batalhas"
              className="btn-metallic px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold"
            >
              Ver Batalhas
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="btn-chrome px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-1.5"
              >
                <Crown size={14} /> Cadastrar Pódio no Painel
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
