import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Swords, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Crown,
  ChevronRight,
  Layers
} from 'lucide-react';
import { battlesService, lookOfTheWeekService, looksService } from '../services/api';
import type { Battle, Look, LookOfTheWeek } from '../types';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { isConfigured } = useAuth();
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  const [lookOfTheWeek, setLookOfTheWeek] = useState<LookOfTheWeek | null>(null);
  const [recentLooks, setRecentLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isConfigured) {
        setLoading(false);
        return;
      }
      try {
        const [battles, lotw, looks] = await Promise.all([
          battlesService.getAll().catch(() => []),
          lookOfTheWeekService.getActive().catch(() => null),
          looksService.getAll().catch(() => []),
        ]);

        const ongoing = battles.find((b) => b.status === 'active' || b.status === 'voting') || battles[0] || null;
        setActiveBattle(ongoing);
        setLookOfTheWeek(lotw);
        setRecentLooks(looks.slice(0, 6));
      } catch (err) {
        console.error('Erro ao carregar dados da Home:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConfigured]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-400 font-mono">Carregando STREETLIFE...</p>
      </div>
    );
  }

  return (
    <div className="space-y-24 py-8">
      {/* ===================================================================== */}
      {/* HERO SECTION — IDENTIDADE VISUAL STREETWEAR FUTURISTA */}
      {/* ===================================================================== */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-10 pb-16 overflow-hidden">
        {/* Reflexos metálicos de fundo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-white/10 via-slate-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-sky-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Badge de Temporada */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-xs font-mono tracking-widest uppercase text-gray-300 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Arena Oficial de Moda Urbana & Sportlife
          </div>

          {/* Título Principal */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase font-display leading-tight">
              Onde o Estilo <br />
              <span className="text-chrome">Se Torna Supremo</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
              Participe de batalhas de looks por edições temáticas, vote nos melhores encaixes e dispute um lugar no lendário Quadro de Campeões da STREETLIFE.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/batalhas"
              className="btn-chrome px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Swords size={18} />
              Explorar Batalhas
            </Link>

            <Link
              to="/campeoes"
              className="btn-metallic px-7 py-3.5 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
            >
              <Trophy size={18} className="text-amber-400" />
              Quadro de Campeões
            </Link>
          </div>

          {/* Métricas / Pilares */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-white/10 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-black text-white font-mono">ED.#01+</div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">Edições Periódicas</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-black text-amber-400 font-mono">1º / 2º / 3º</div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">Pódio Oficial</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-black text-white font-mono">100%</div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">Curadoria Real</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-black text-sky-400 font-mono">LIVE</div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">Supabase Realtime</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SEÇÃO: LOOK DA SEMANA EM DESTAQUE (INDEPENDENTE) */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-sky-400 mb-1">
              <Sparkles size={14} /> Seleção Especial
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-display">
              Look da Semana
            </h2>
          </div>
          <Link
            to="/look-da-semana"
            className="text-xs uppercase tracking-wider text-gray-400 hover:text-white flex items-center gap-1 transition-colors font-semibold"
          >
            Ver Detalhes <ArrowRight size={14} />
          </Link>
        </div>

        {lookOfTheWeek ? (
          <div className="metallic-card rounded-2xl overflow-hidden border border-white/15 p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Imagem com visual streetwear */}
              <div className="lg:col-span-5 relative group overflow-hidden rounded-xl border border-white/10 aspect-[4/5] bg-obsidian-900">
                <img
                  src={lookOfTheWeek.image_url}
                  alt={lookOfTheWeek.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback visual streetwear elegante
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider bg-black/80 backdrop-blur-md text-white border border-white/20">
                    {lookOfTheWeek.highlight_period}
                  </span>
                </div>
              </div>

              {/* Informações Editoriais */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">
                    Por {lookOfTheWeek.author_name}
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                    {lookOfTheWeek.title}
                  </h3>
                </div>

                {/* Comentário da Curadoria */}
                <div className="bg-obsidian-900/90 border-l-2 border-white/40 p-5 rounded-r-xl space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Flame size={12} className="text-amber-400" /> Parecer da Curadoria STREETLIFE:
                  </div>
                  <p className="text-sm sm:text-base text-gray-300 italic leading-relaxed">
                    "{lookOfTheWeek.curator_comment}"
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-4">
                  <Link
                    to="/look-da-semana"
                    className="btn-chrome px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    Ver Destaque Completo <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="metallic-card rounded-2xl p-10 text-center border border-dashed border-white/15 space-y-3">
            <Sparkles size={36} className="mx-auto text-gray-500" />
            <h3 className="text-lg font-bold text-white uppercase">Nenhum Look em Destaque nesta Semana</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              O administrador pode selecionar e definir o look da semana no painel de controle a qualquer momento.
            </p>
            <Link to="/look-da-semana" className="btn-metallic inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg mt-2">
              Acessar Página do Look da Semana
            </Link>
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* SEÇÃO: BATALHA ATIVA OU EM ANDAMENTO */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
              <Swords size={14} /> Competição Oficial
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-display">
              Batalha da Temporada
            </h2>
          </div>
          <Link
            to="/batalhas"
            className="text-xs uppercase tracking-wider text-gray-400 hover:text-white flex items-center gap-1 transition-colors font-semibold"
          >
            Ver Todas as Edições <ArrowRight size={14} />
          </Link>
        </div>

        {activeBattle ? (
          <div className="metallic-card rounded-2xl overflow-hidden border border-white/15 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-white text-black">
                    EDIÇÃO #{String(activeBattle.edition_number).padStart(2, '0')}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider ${
                    activeBattle.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : activeBattle.status === 'voting'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/10 text-gray-300 border border-white/20'
                  }`}>
                    {activeBattle.status === 'active' ? 'Inscrições Abertas' : activeBattle.status === 'voting' ? 'Em Votação' : 'Concluída'}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {activeBattle.title}
                </h3>

                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                  Tema: <span className="text-white font-bold">{activeBattle.theme}</span>
                </div>

                {activeBattle.description && (
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {activeBattle.description}
                  </p>
                )}

                {activeBattle.prize_info && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                    <Trophy size={16} className="text-amber-400 shrink-0" />
                    <span><strong>Premiação:</strong> {activeBattle.prize_info}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    to="/batalhas"
                    className="btn-chrome px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    Ver Detalhes da Edição <ChevronRight size={14} />
                  </Link>
                  <Link
                    to="/comunidade"
                    className="btn-metallic px-5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider"
                  >
                    Ver Looks Inscritos
                  </Link>
                </div>
              </div>

              {/* Imagem de Capa da Batalha */}
              <div className="relative aspect-video md:aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-obsidian-900 group">
                <img
                  src={activeBattle.cover_image_url || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80'}
                  alt={activeBattle.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent opacity-60" />
              </div>
            </div>
          </div>
        ) : (
          <div className="metallic-card rounded-2xl p-10 text-center border border-dashed border-white/15 space-y-3">
            <Swords size={36} className="mx-auto text-gray-500" />
            <h3 className="text-lg font-bold text-white uppercase">Nenhuma Edição Aberta no Momento</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Novas edições temáticas de batalhas de looks são cadastradas periodicamente pelo administrador.
            </p>
            <Link to="/batalhas" className="btn-metallic inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg mt-2">
              Explorar Histórico de Batalhas
            </Link>
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* SEÇÃO: GALERIA DE LOOKS DA COMUNIDADE */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-gray-400 mb-1">
              <Layers size={14} /> Feed de Looks
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-display">
              Galeria da Comunidade
            </h2>
          </div>
          <Link
            to="/comunidade"
            className="text-xs uppercase tracking-wider text-gray-400 hover:text-white flex items-center gap-1 transition-colors font-semibold"
          >
            Ver Comunidade Completa <ArrowRight size={14} />
          </Link>
        </div>

        {recentLooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recentLooks.map((look) => (
              <div key={look.id} className="metallic-card rounded-xl overflow-hidden border border-white/10 group">
                <div className="relative aspect-[3/4] bg-obsidian-900 overflow-hidden">
                  <img
                    src={look.image_url}
                    alt={look.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {look.style_tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-black/75 backdrop-blur-md text-white border border-white/10">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <div className="text-[11px] font-mono text-gray-400">
                    @{look.participant_name}
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase truncate">
                    {look.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="metallic-card rounded-2xl p-10 text-center border border-dashed border-white/15 space-y-3">
            <Layers size={36} className="mx-auto text-gray-500" />
            <h3 className="text-lg font-bold text-white uppercase">Comunidade em Formação</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Cadastre-se na STREETLIFE para enviar seus looks e participar das próximas batalhas.
            </p>
            <Link to="/cadastro" className="btn-chrome inline-flex items-center gap-1.5 text-xs px-5 py-2.5 rounded-lg mt-2">
              Criar Conta e Participar
            </Link>
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* BANNER DE CHAMADA PARA O QUADRO DE CAMPEÕES */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-obsidian-900 to-amber-950/40 p-8 sm:p-12 text-center space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto">
            <Crown size={32} />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase font-display">
              O Pódio dos Campeões
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Conheça os vencedores absolutos de cada edição da STREETLIFE, seus looks icônicos e a consagração na história da cena streetwear.
            </p>
          </div>
          <div>
            <Link
              to="/campeoes"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:brightness-110 transition-all shadow-[0_0_25px_rgba(234,179,8,0.25)]"
            >
              <Trophy size={16} /> Acessar Quadro de Campeões
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
