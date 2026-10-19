import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Filter, 
  Layers, 
  X, 
  Check, 
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { looksService, battlesService } from '../services/api';
import type { Look, Battle, LookPiece } from '../types';
import { useAuth } from '../context/AuthContext';

export const Community: React.FC = () => {
  const { user, isConfigured } = useAuth();
  const [looks, setLooks] = useState<Look[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedLook, setSelectedLook] = useState<Look | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Form de Envio de Look
  const [title, setTitle] = useState('');
  const [participantName, setParticipantName] = useState(user?.email?.split('@')[0] || '');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('sportlife, techwear');
  const [selectedBattleId, setSelectedBattleId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Peças de roupa
  const [pieces, setPieces] = useState<LookPiece[]>([
    { brand: 'Nike', item: 'Air Max Plus TN' },
    { brand: 'Streetlife', item: 'Cargo Heavy Black' },
  ]);

  const loadData = async () => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    try {
      const [looksData, battlesData] = await Promise.all([
        looksService.getAll(),
        battlesService.getAll(),
      ]);
      setLooks(looksData);
      setBattles(battlesData.filter((b) => b.status === 'active' || b.status === 'voting'));
    } catch (err) {
      console.error('Erro ao carregar dados da comunidade:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isConfigured]);

  const handleAddPiece = () => {
    setPieces([...pieces, { brand: '', item: '' }]);
  };

  const handleUpdatePiece = (index: number, field: 'brand' | 'item', value: string) => {
    const updated = [...pieces];
    updated[index][field] = value;
    setPieces(updated);
  };

  const handleRemovePiece = (index: number) => {
    setPieces(pieces.filter((_, i) => i !== index));
  };

  const handleSubmitLook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSubmitError('Você precisa estar autenticado para enviar um look.');
      return;
    }
    if (!imageUrl.trim() || !title.trim() || !participantName.trim()) {
      setSubmitError('Preencha título, seu nome/apelido e a URL da foto.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const filteredPieces = pieces.filter((p) => p.brand.trim() || p.item.trim());

      await looksService.create({
        user_id: user.id,
        battle_id: selectedBattleId ? selectedBattleId : null,
        participant_name: participantName.trim(),
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim(),
        style_tags: parsedTags,
        pieces: filteredPieces,
        status: 'approved',
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setSubmitSuccess(false);
        setTitle('');
        setImageUrl('');
        setDescription('');
        loadData();
      }, 1500);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Falha ao enviar look.');
    } finally {
      setSubmitting(false);
    }
  };

  // Coleta todas as tags únicas
  const allTags = Array.from(
    new Set(looks.flatMap((l) => l.style_tags || []))
  );

  const filteredLooks = looks.filter((look) => {
    if (selectedTag === 'all') return true;
    return look.style_tags.includes(selectedTag);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Cabeçalho */}
      <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-sky-400">
            <Users size={14} /> Espaço da Comunidade
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-display">
            Membros & Encaixes
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
            A vitrine da galera. Explore os looks da comunidade, descubra marcas, detalhes das peças e envie seus próprios registros streetwear.
          </p>
        </div>

        {/* Botão de Enviar Look */}
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="btn-chrome px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus size={16} /> Enviar Meu Look
            </button>
          ) : (
            <Link
              to="/login"
              className="btn-chrome px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              Entrar para Enviar Look
            </Link>
          )}
        </div>
      </div>

      {/* Barra de Filtro de Tags */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-mono text-gray-400 uppercase flex items-center gap-1 shrink-0">
            <Filter size={12} /> Estilos:
          </span>
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedTag === 'all'
                ? 'bg-white text-black font-bold'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            Todos
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-white text-black font-bold'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid de Looks */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400 font-mono">Carregando galeria da comunidade...</p>
        </div>
      ) : filteredLooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredLooks.map((look) => (
            <div
              key={look.id}
              onClick={() => setSelectedLook(look)}
              className="metallic-card rounded-2xl overflow-hidden border border-white/10 cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative aspect-[3/4] bg-obsidian-900 overflow-hidden">
                <img
                  src={look.image_url}
                  alt={look.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                  {look.style_tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-black/75 backdrop-blur-md text-white border border-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 space-y-1">
                <div className="text-[11px] font-mono text-gray-400 truncate">
                  @{look.participant_name}
                </div>
                <h3 className="text-sm font-bold text-white uppercase truncate group-hover:text-chrome transition-colors">
                  {look.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="metallic-card rounded-2xl p-14 text-center border border-dashed border-white/15 space-y-4 max-w-xl mx-auto">
          <Layers size={48} className="mx-auto text-gray-500" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white uppercase">Nenhum Look Cadastrado</h3>
            <p className="text-xs text-gray-400">
              Seja o pioneiro e envie o primeiro visual streetwear na STREETLIFE!
            </p>
          </div>
          {user ? (
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="btn-chrome px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <Plus size={16} /> Enviar Look Agora
            </button>
          ) : (
            <Link
              to="/cadastro"
              className="btn-chrome px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              Cadastre-se para Postar
            </Link>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DE DETALHES DO LOOK SELECIONADO */}
      {/* ===================================================================== */}
      {selectedLook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="metallic-card w-full max-w-3xl rounded-2xl border border-white/20 p-6 md:p-8 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedLook(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-obsidian-900 border border-white/10">
                <img
                  src={selectedLook.image_url}
                  alt={selectedLook.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-5">
                <div>
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    Styling por: <strong className="text-white">@{selectedLook.participant_name}</strong>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase mt-1">
                    {selectedLook.title}
                  </h2>
                </div>

                {selectedLook.description && (
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    {selectedLook.description}
                  </p>
                )}

                {/* Tags de Estilo */}
                {selectedLook.style_tags.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-gray-400 uppercase block">Estilos & Tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedLook.style_tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded text-xs font-mono uppercase bg-white/10 text-white border border-white/10"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Peças e Marcas Cadastradas */}
                {selectedLook.pieces && selectedLook.pieces.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                      <ShoppingBag size={14} className="text-sky-400" />
                      Breakdown das Peças:
                    </span>
                    <div className="space-y-1.5">
                      {selectedLook.pieces.map((piece, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-obsidian-900 border border-white/5"
                        >
                          <span className="font-semibold text-gray-200">{piece.brand}</span>
                          <span className="text-gray-400 font-mono">{piece.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => setSelectedLook(null)}
                    className="btn-metallic px-5 py-2 rounded-xl text-xs uppercase tracking-wider"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DE ENVIO DE NOVO LOOK */}
      {/* ===================================================================== */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="metallic-card w-full max-w-xl rounded-2xl border border-white/20 p-6 md:p-8 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="space-y-2 mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase">
                Enviar Look para a Comunidade
              </h2>
              <p className="text-xs text-gray-400">
                Mostre sua presença e estética. O look ficará visível na galeria pública.
              </p>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Check size={24} />
                </div>
                <h3 className="text-lg font-bold text-white uppercase">Look Publicado com Sucesso!</h3>
                <p className="text-xs text-gray-400">Atualizando o feed da comunidade...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLook} className="space-y-4">
                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                      Seu Nome / @Nick
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: @kai_street"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                      Título do Look
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Cyber Techwear Nightout"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                    URL da Foto do Look
                  </label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/foto-do-look.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 font-mono"
                    required
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Cole uma URL direta de imagem (Unsplash, Imgur, Supabase Storage, etc.).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                    Tags de Estilo (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="sportlife, techwear, minimal, drill"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 font-mono"
                  />
                </div>

                {battles.length > 0 && (
                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                      Inscrever em Batalha Aberta (Opcional)
                    </label>
                    <select
                      value={selectedBattleId}
                      onChange={(e) => setSelectedBattleId(e.target.value)}
                      className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 font-mono"
                    >
                      <option value="">Apenas Galeria da Comunidade</option>
                      {battles.map((b) => (
                        <option key={b.id} value={b.id}>
                          ED. #{b.edition_number} — {b.title} ({b.theme})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                    Descrição ou Conceito do Encaixe
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Conte um pouco da inspiração ou caimento..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                {/* Peças / Breakdown */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-300 uppercase">Peças Principais (Opcional)</span>
                    <button
                      type="button"
                      onClick={handleAddPiece}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1"
                    >
                      <Plus size={12} /> Adicionar Peça
                    </button>
                  </div>

                  {pieces.map((piece, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Marca (ex: Nike)"
                        value={piece.brand}
                        onChange={(e) => handleUpdatePiece(idx, 'brand', e.target.value)}
                        className="flex-1 bg-obsidian-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Item (ex: Air Max Plus)"
                        value={piece.item}
                        onChange={(e) => handleUpdatePiece(idx, 'item', e.target.value)}
                        className="flex-1 bg-obsidian-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePiece(idx)}
                        className="p-1.5 text-gray-400 hover:text-rose-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-chrome px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? 'Enviando...' : 'Publicar Look'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
