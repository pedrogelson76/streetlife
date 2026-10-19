import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Swords, 
  Trophy, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Layers,
  X
} from 'lucide-react';
import { battlesService, looksService } from '../services/api';
import type { Battle, Look } from '../types';
import { useAuth } from '../context/AuthContext';

export const Battles: React.FC = () => {
  const { isConfigured, isAdmin } = useAuth();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'voting' | 'completed'>('all');
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [battleLooks, setBattleLooks] = useState<Look[]>([]);
  const [loadingLooks, setLoadingLooks] = useState(false);

  useEffect(() => {
    const loadBattles = async () => {
      if (!isConfigured) {
        setLoading(false);
        return;
      }
      try {
        const data = await battlesService.getAll();
        setBattles(data);
      } catch (err) {
        console.error('Erro ao carregar batalhas:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBattles();
  }, [isConfigured]);

  const handleOpenDetails = async (battle: Battle) => {
    setSelectedBattle(battle);
    setLoadingLooks(true);
    try {
      const looks = await looksService.getAll({ battle_id: battle.id });
      setBattleLooks(looks);
    } catch (err) {
      console.error('Erro ao carregar looks da batalha:', err);
      setBattleLooks([]);
    } finally {
      setLoadingLooks(false);
    }
  };

  const filteredBattles = battles.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const getStatusBadge = (status: Battle['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Inscrições Abertas
          </span>
        );
      case 'voting':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock size={10} />
            Em Votação
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/10 text-gray-300 border border-white/20 flex items-center gap-1">
            <CheckCircle2 size={10} />
            Concluída
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-gray-800 text-gray-400 border border-gray-700">
            Rascunho
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Cabeçalho da Página */}
      <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-sky-400">
            <Swords size={14} /> Arena de Competições
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-display">
            Batalhas & Edições
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
            Acompanhe todas as temporadas da STREETLIFE. Cada edição traz um tema conceitual exclusivo da cultura streetwear e sportlife.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(
            [
              { key: 'all', label: 'Todas' },
              { key: 'active', label: 'Abertas' },
              { key: 'voting', label: 'Votação' },
              { key: 'completed', label: 'Concluídas' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === item.key
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Batalhas */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400 font-mono">Carregando edições da arena...</p>
        </div>
      ) : filteredBattles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBattles.map((battle) => (
            <div
              key={battle.id}
              className="metallic-card rounded-2xl overflow-hidden border border-white/10 flex flex-col group"
            >
              {/* Capa */}
              <div className="relative aspect-video bg-obsidian-900 overflow-hidden">
                <img
                  src={battle.cover_image_url || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'}
                  alt={battle.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-white font-mono text-xs font-bold border border-white/20">
                    ED. #{String(battle.edition_number).padStart(2, '0')}
                  </span>
                  {getStatusBadge(battle.status)}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">
                    Tema: <span className="text-white font-semibold">{battle.theme}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight group-hover:text-chrome transition-colors">
                    {battle.title}
                  </h3>
                  {battle.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {battle.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  {battle.prize_info && (
                    <div className="text-[11px] text-amber-300 flex items-center gap-1.5 font-mono">
                      <Trophy size={13} className="shrink-0" />
                      <span className="truncate">{battle.prize_info}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleOpenDetails(battle)}
                      className="text-xs uppercase tracking-wider text-white hover:text-chrome font-semibold flex items-center gap-1 transition-colors"
                    >
                      Ver Detalhes & Looks <ArrowRight size={13} />
                    </button>

                    {battle.status === 'completed' && (
                      <Link
                        to="/campeoes"
                        className="text-[11px] font-mono text-amber-400 hover:underline flex items-center gap-1"
                      >
                        Ver Pódio
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="metallic-card rounded-2xl p-12 text-center border border-dashed border-white/15 space-y-4 max-w-xl mx-auto">
          <Swords size={40} className="mx-auto text-gray-500" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white uppercase">
              Nenhuma Batalha Encontrada
            </h3>
            <p className="text-xs text-gray-400">
              {filter !== 'all'
                ? 'Nenhuma edição com o filtro selecionado no momento.'
                : 'Ainda não há edições de batalhas cadastradas na plataforma.'}
            </p>
          </div>
          {isAdmin && (
            <Link
              to="/admin"
              className="btn-chrome inline-flex items-center gap-2 text-xs px-5 py-2.5 rounded-xl font-bold"
            >
              Criar Primeira Batalha no Painel
            </Link>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DE DETALHES DA BATALHA & LOOKS INSCRITOS */}
      {/* ===================================================================== */}
      {selectedBattle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="metallic-card w-full max-w-3xl rounded-2xl border border-white/20 p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6 relative">
            <button
              onClick={() => setSelectedBattle(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            {/* Topo do Modal */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded bg-white text-black font-mono text-xs font-bold">
                EDIÇÃO #{String(selectedBattle.edition_number).padStart(2, '0')}
              </span>
              {getStatusBadge(selectedBattle.status)}
              <span className="text-xs font-mono text-gray-400">
                Tema: <strong className="text-white">{selectedBattle.theme}</strong>
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
                {selectedBattle.title}
              </h2>
              {selectedBattle.description && (
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mt-2">
                  {selectedBattle.description}
                </p>
              )}
            </div>

            {/* Informações de Regras e Premiação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {selectedBattle.rules && (
                <div className="p-4 rounded-xl bg-obsidian-900 border border-white/5 space-y-1">
                  <span className="font-mono uppercase text-gray-400 text-[10px] block">
                    Regras de Participação:
                  </span>
                  <p className="text-gray-300">{selectedBattle.rules}</p>
                </div>
              )}
              {selectedBattle.prize_info && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
                  <span className="font-mono uppercase text-amber-400 text-[10px] block flex items-center gap-1">
                    <Trophy size={12} /> Premiação Oficial:
                  </span>
                  <p className="font-semibold">{selectedBattle.prize_info}</p>
                </div>
              )}
            </div>

            {/* Looks Participantes desta Batalha */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white font-mono flex items-center gap-1.5">
                  <Layers size={14} /> Looks Inscritos nesta Edição ({battleLooks.length})
                </h4>
                <Link
                  to="/comunidade"
                  className="text-[11px] text-gray-400 hover:text-white font-mono"
                >
                  Ver no Feed Geral
                </Link>
              </div>

              {loadingLooks ? (
                <div className="py-8 text-center text-xs text-gray-400 font-mono">
                  Carregando looks inscritos...
                </div>
              ) : battleLooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {battleLooks.map((look) => (
                    <div key={look.id} className="rounded-xl overflow-hidden border border-white/10 bg-obsidian-900">
                      <div className="aspect-[3/4] relative">
                        <img
                          src={look.image_url}
                          alt={look.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=500&q=80';
                          }}
                        />
                      </div>
                      <div className="p-2.5 space-y-0.5">
                        <div className="text-[10px] font-mono text-gray-400 truncate">
                          @{look.participant_name}
                        </div>
                        <div className="text-xs font-bold text-white truncate uppercase">
                          {look.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-obsidian-900/50 border border-dashed border-white/10 text-center text-xs text-gray-400">
                  Nenhum look inscrito associado diretamente a esta edição até o momento.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBattle(null)}
                className="btn-chrome px-5 py-2 rounded-xl text-xs uppercase tracking-wider"
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
