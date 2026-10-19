import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Flame, 
  Calendar, 
  Share2, 
  Clock, 
  Layers, 
  Crown
} from 'lucide-react';
import { lookOfTheWeekService } from '../services/api';
import type { LookOfTheWeek as LookOfTheWeekType } from '../types';
import { useAuth } from '../context/AuthContext';

export const LookOfTheWeek: React.FC = () => {
  const { isConfigured, isAdmin } = useAuth();
  const [activeLook, setActiveLook] = useState<LookOfTheWeekType | null>(null);
  const [history, setHistory] = useState<LookOfTheWeekType[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!isConfigured) {
        setLoading(false);
        return;
      }
      try {
        const [active, all] = await Promise.all([
          lookOfTheWeekService.getActive(),
          lookOfTheWeekService.getAll(),
        ]);
        setActiveLook(active);
        setHistory(all.filter((item) => !item.is_active));
      } catch (err) {
        console.error('Erro ao carregar look da semana:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConfigured]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Look da Semana: ${activeLook?.title}`,
        text: `Confira o Look da Semana STREETLIFE selecionado pela curadoria: ${activeLook?.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Cabeçalho */}
      <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-sky-400">
            <Sparkles size={14} /> Curadoria Independente
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-display">
            Look da Semana
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
            Uma seleção editorial semanal independente dos vencedores de batalhas. 
            O styling mais ousado, autêntico e expressivo escolhido a dedo pela curadoria da STREETLIFE.
          </p>
        </div>

        {activeLook && (
          <button
            onClick={handleShare}
            className="btn-metallic px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 self-start md:self-auto"
          >
            <Share2 size={14} />
            {copied ? 'Link Copiado!' : 'Compartilhar Destaque'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400 font-mono">Carregando look em destaque...</p>
        </div>
      ) : activeLook ? (
        <div className="space-y-16">
          {/* Showcase Principal */}
          <div className="metallic-card rounded-3xl overflow-hidden border border-white/20 p-6 md:p-10 shadow-2xl relative">
            {/* Brilho sutil de fundo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/5 to-transparent blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Imagem do Look com moldura premium */}
              <div className="lg:col-span-6 relative aspect-[3/4] rounded-2xl overflow-hidden bg-obsidian-900 border border-white/15 group shadow-2xl">
                <img
                  src={activeLook.image_url}
                  alt={activeLook.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider bg-black/85 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5 shadow-lg">
                    <Calendar size={13} className="text-sky-400" />
                    {activeLook.highlight_period}
                  </span>
                </div>
              </div>

              {/* Informações Editoriais */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-white/5 border border-white/15 text-gray-300 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Destaque Atual da Semana
                  </div>
                  
                  <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-display">
                    {activeLook.title}
                  </h2>

                  <div className="text-sm font-mono text-gray-400 mt-2">
                    Styling por: <strong className="text-white text-base">@{activeLook.author_name}</strong>
                  </div>
                </div>

                {/* Comentário da Curadoria */}
                <div className="bg-obsidian-900/90 border-l-4 border-white p-6 rounded-r-2xl space-y-2">
                  <div className="text-xs font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-400" /> Parecer Oficial da Curadoria:
                  </div>
                  <p className="text-base sm:text-lg text-gray-200 italic leading-relaxed font-light">
                    "{activeLook.curator_comment}"
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} /> Selecionado em: {new Date(activeLook.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  <span>•</span>
                  <div>Consagrado no Acervo STREETLIFE</div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* HISTÓRICO DE LOOKS DA SEMANA ANTERIORES */}
          {/* ===================================================================== */}
          {history.length > 0 && (
            <div className="space-y-6 pt-8 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white uppercase font-display flex items-center gap-2">
                    <Layers size={20} className="text-gray-400" />
                    Edições Anteriores do Look da Semana
                  </h3>
                  <p className="text-xs text-gray-400">
                    Arquivo histórico dos destaques selecionados nas semanas passadas.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {history.map((item) => (
                  <div key={item.id} className="metallic-card rounded-2xl overflow-hidden border border-white/10 group">
                    <div className="relative aspect-[3/4] bg-obsidian-900 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded text-[10px] font-mono uppercase bg-black/80 backdrop-blur-md text-white border border-white/15">
                          {item.highlight_period}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <div className="text-[11px] font-mono text-gray-400">
                        @{item.author_name}
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2 italic pt-1">
                        "{item.curator_comment}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="metallic-card rounded-2xl p-14 text-center border border-dashed border-white/15 space-y-4 max-w-xl mx-auto">
          <Sparkles size={48} className="mx-auto text-sky-400/60" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white uppercase">
              Nenhum Look em Destaque Definido
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              O Look da Semana é uma seleção editorial única feita pelo administrador para celebrar o estilo mais marcante da comunidade.
              {isAdmin && ' Como administrador, você pode selecionar e definir o look agora mesmo pelo Painel.'}
            </p>
          </div>

          {isAdmin && (
            <div className="pt-2">
              <Link
                to="/admin"
                className="btn-chrome px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold inline-flex items-center gap-1.5"
              >
                <Crown size={14} /> Definir Look da Semana no Painel
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
