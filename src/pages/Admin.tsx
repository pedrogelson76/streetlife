import React, { useEffect, useState } from 'react';
import { 
  Crown, 
  Swords, 
  Trophy, 
  Sparkles, 
  Bell, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Layers,
  Radio
} from 'lucide-react';
import { 
  battlesService, 
  looksService, 
  resultsService, 
  lookOfTheWeekService, 
  notificationsService 
} from '../services/api';
import type { Battle, Look, BattleResult, LookOfTheWeek, UserNotification } from '../types';
import { useAuth } from '../context/AuthContext';

export const Admin: React.FC = () => {
  const { user, isAdmin, isConfigured, claimInitialAdmin, refreshAdminStatus } = useAuth();
  
  // Tab ativa
  const [activeTab, setActiveTab] = useState<'battles' | 'champions' | 'looks' | 'lotw' | 'notifications'>('battles');

  // Estados de dados
  const [battles, setBattles] = useState<Battle[]>([]);
  const [looks, setLooks] = useState<Look[]>([]);
  const [results, setResults] = useState<{ battle: Battle; results: BattleResult[] }[]>([]);
  const [lotwList, setLotwList] = useState<LookOfTheWeek[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  
  // Estados de carregamento e feedback
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Permissão de Notificações do Navegador
  const [browserNotificationPerm, setBrowserNotificationPerm] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Estados de Modais
  const [battleModalOpen, setBattleModalOpen] = useState(false);
  const [editingBattle, setEditingBattle] = useState<Battle | null>(null);
  const [battleForm, setBattleForm] = useState({
    edition_number: 1,
    title: '',
    theme: '',
    description: '',
    cover_image_url: '',
    status: 'active' as Battle['status'],
    prize_info: '',
    rules: '',
  });

  // Modal de Resultados / Pódio
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultForm, setResultForm] = useState<{
    battle_id: string;
    placement: 1 | 2 | 3;
    participant_name: string;
    look_title: string;
    look_image_url: string;
    custom_notes: string;
  }>({
    battle_id: '',
    placement: 1,
    participant_name: '',
    look_title: '',
    look_image_url: '',
    custom_notes: '',
  });

  // Modal de Look
  const [lookModalOpen, setLookModalOpen] = useState(false);
  const [editingLook, setEditingLook] = useState<Look | null>(null);
  const [lookForm, setLookForm] = useState({
    participant_name: '',
    title: '',
    image_url: '',
    description: '',
    style_tags: 'techwear, sportlife',
    battle_id: '',
  });

  // Modal de Look da Semana
  const [lotwModalOpen, setLotwModalOpen] = useState(false);
  const [editingLotw, setEditingLotw] = useState<LookOfTheWeek | null>(null);
  const [lotwForm, setLotwForm] = useState({
    title: '',
    author_name: '',
    image_url: '',
    curator_comment: '',
    highlight_period: `Semana ${new Date().toLocaleDateString('pt-BR')}`,
    is_active: true,
  });

  // Modal de Confirmação de Exclusão
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'battle' | 'look' | 'result' | 'lotw' | 'notification';
    id: string;
    label: string;
  } | null>(null);

  // Feedback helper
  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Carrega todos os dados do painel
  const loadAllAdminData = async () => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [battlesData, looksData, resultsData, lotwData, notifsData] = await Promise.all([
        battlesService.getAll().catch(() => []),
        looksService.getAll().catch(() => []),
        resultsService.getAllWithBattles().catch(() => []),
        lookOfTheWeekService.getAll().catch(() => []),
        isAdmin ? notificationsService.getAll().catch(() => []) : Promise.resolve([]),
      ]);

      setBattles(battlesData);
      setLooks(looksData);
      setResults(resultsData);
      setLotwList(lotwData);
      setNotifications(notifsData);
    } catch (err) {
      console.error('Erro ao carregar dados administrativos:', err);
      showFeedback('error', 'Falha ao buscar dados administrativos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [isConfigured, isAdmin]);

  // Supabase Realtime para notificações de novos usuários enquanto o painel estiver aberto
  useEffect(() => {
    if (!isConfigured || !isAdmin) return;

    const unsubscribe = notificationsService.subscribeToNewUsers((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);

      // Dispara notificação no navegador se permissão estiver concedida
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('STREETLIFE — Novo Usuário Registrado!', {
          body: `O e-mail ${newNotif.email} acabou de se cadastrar na plataforma.`,
          icon: '/favicon.svg',
        });
      }

      showFeedback('success', `Novo cadastro em tempo real: ${newNotif.email}`);
    });

    return () => {
      unsubscribe();
    };
  }, [isConfigured, isAdmin]);

  // Solicitar permissão de notificação do navegador
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setBrowserNotificationPerm(permission);
      if (permission === 'granted') {
        showFeedback('success', 'Permissão de notificação do navegador concedida!');
        new Notification('STREETLIFE Ativado', {
          body: 'Notificações em tempo real estão funcionando para sua sessão de administrador.',
        });
      } else {
        showFeedback('error', 'Permissão não concedida. As notificações aparecerão somente no painel.');
      }
    } else {
      showFeedback('error', 'Seu navegador não suporta a Notification API.');
    }
  };

  // ==============================================================================
  // AÇÕES CRUD: BATALHAS
  // ==============================================================================

  const handleOpenCreateBattle = () => {
    const nextEdition = battles.length > 0 ? Math.max(...battles.map((b) => b.edition_number)) + 1 : 1;
    setEditingBattle(null);
    setBattleForm({
      edition_number: nextEdition,
      title: '',
      theme: '',
      description: '',
      cover_image_url: '',
      status: 'active',
      prize_info: '',
      rules: 'Uso obrigatório de peças streetwear ou sportlife. Envio de foto nítida de corpo inteiro.',
    });
    setBattleModalOpen(true);
  };

  const handleOpenEditBattle = (battle: Battle) => {
    setEditingBattle(battle);
    setBattleForm({
      edition_number: battle.edition_number,
      title: battle.title,
      theme: battle.theme,
      description: battle.description || '',
      cover_image_url: battle.cover_image_url || '',
      status: battle.status,
      prize_info: battle.prize_info || '',
      rules: battle.rules || '',
    });
    setBattleModalOpen(true);
  };

  const handleSaveBattle = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingBattle) {
        await battlesService.update(editingBattle.id, battleForm);
        showFeedback('success', 'Batalha atualizada com sucesso!');
      } else {
        await battlesService.create({
          ...battleForm,
          start_date: new Date().toISOString(),
          end_date: null,
        });
        showFeedback('success', 'Nova edição de batalha criada!');
      }
      setBattleModalOpen(false);
      loadAllAdminData();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Falha ao salvar batalha.');
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================================================================
  // AÇÕES CRUD: RESULTADOS / PÓDIO DE CAMPEÕES
  // ==============================================================================

  const handleOpenCreateResult = (battleId?: string) => {
    setResultForm({
      battle_id: battleId || (battles[0]?.id || ''),
      placement: 1,
      participant_name: '',
      look_title: '',
      look_image_url: '',
      custom_notes: '',
    });
    setResultModalOpen(true);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultForm.battle_id) {
      showFeedback('error', 'Selecione uma edição de batalha.');
      return;
    }
    setActionLoading(true);
    try {
      await resultsService.savePlacement(resultForm);
      showFeedback('success', `Colocação ${resultForm.placement}º Lugar registrada com sucesso!`);
      setResultModalOpen(false);
      loadAllAdminData();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Falha ao salvar resultado.');
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================================================================
  // AÇÕES CRUD: LOOK DA SEMANA
  // ==============================================================================

  const handleOpenCreateLotw = () => {
    setEditingLotw(null);
    setLotwForm({
      title: '',
      author_name: '',
      image_url: '',
      curator_comment: '',
      highlight_period: `${new Date().toLocaleDateString('pt-BR')}`,
      is_active: true,
    });
    setLotwModalOpen(true);
  };

  const handleOpenEditLotw = (item: LookOfTheWeek) => {
    setEditingLotw(item);
    setLotwForm({
      title: item.title,
      author_name: item.author_name,
      image_url: item.image_url,
      curator_comment: item.curator_comment,
      highlight_period: item.highlight_period,
      is_active: item.is_active,
    });
    setLotwModalOpen(true);
  };

  const handleSaveLotw = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingLotw) {
        await lookOfTheWeekService.update(editingLotw.id, lotwForm);
        showFeedback('success', 'Look da Semana atualizado com sucesso!');
      } else {
        await lookOfTheWeekService.createOrUpdate({
          ...lotwForm,
          look_id: null,
        });
        showFeedback('success', 'Novo Look da Semana consagrado e ativado!');
      }
      setLotwModalOpen(false);
      loadAllAdminData();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Falha ao salvar Look da Semana.');
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================================================================
  // AÇÕES CRUD: LOOKS DA COMUNIDADE
  // ==============================================================================

  const handleOpenCreateLook = () => {
    setEditingLook(null);
    setLookForm({
      participant_name: '',
      title: '',
      image_url: '',
      description: '',
      style_tags: 'sportlife, streetwear',
      battle_id: battles[0]?.id || '',
    });
    setLookModalOpen(true);
  };

  const handleOpenEditLook = (look: Look) => {
    setEditingLook(look);
    setLookForm({
      participant_name: look.participant_name,
      title: look.title,
      image_url: look.image_url,
      description: look.description || '',
      style_tags: (look.style_tags || []).join(', '),
      battle_id: look.battle_id || '',
    });
    setLookModalOpen(true);
  };

  const handleSaveLook = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const parsedTags = lookForm.style_tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      if (editingLook) {
        await looksService.update(editingLook.id, {
          participant_name: lookForm.participant_name,
          title: lookForm.title,
          image_url: lookForm.image_url,
          description: lookForm.description || null,
          style_tags: parsedTags,
          battle_id: lookForm.battle_id ? lookForm.battle_id : null,
        });
        showFeedback('success', 'Look atualizado com sucesso!');
      } else {
        await looksService.create({
          user_id: user?.id || null,
          battle_id: lookForm.battle_id ? lookForm.battle_id : null,
          participant_name: lookForm.participant_name,
          title: lookForm.title,
          image_url: lookForm.image_url,
          description: lookForm.description || null,
          style_tags: parsedTags,
          pieces: [],
          status: 'approved',
        });
        showFeedback('success', 'Novo look adicionado à plataforma!');
      }
      setLookModalOpen(false);
      loadAllAdminData();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Falha ao salvar look.');
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================================================================
  // EXCLUSÃO GENERALIZADA COM CONFIRMAÇÃO
  // ==============================================================================

  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;
    setActionLoading(true);
    try {
      switch (deleteConfirm.type) {
        case 'battle':
          await battlesService.delete(deleteConfirm.id);
          showFeedback('success', 'Edição de batalha excluída!');
          break;
        case 'result':
          await resultsService.deletePlacement(deleteConfirm.id);
          showFeedback('success', 'Colocação removida do pódio!');
          break;
        case 'look':
          await looksService.delete(deleteConfirm.id);
          showFeedback('success', 'Look removido da base!');
          break;
        case 'lotw':
          await lookOfTheWeekService.delete(deleteConfirm.id);
          showFeedback('success', 'Registro do Look da Semana removido!');
          break;
        case 'notification':
          await notificationsService.delete(deleteConfirm.id);
          showFeedback('success', 'Notificação excluída!');
          break;
      }
      setDeleteConfirm(null);
      loadAllAdminData();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Falha ao excluir item.');
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================================================================
  // NOTIFICAÇÕES: MARCAR COMO LIDA
  // ==============================================================================

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      showFeedback('success', 'Notificação marcada como visualizada.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showFeedback('success', 'Todas as notificações foram marcadas como lidas.');
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ==============================================================================
  // CASO USUÁRIO NÃO SEJA ADMINISTRADOR: OFERECER CLAIM DO PRIMEIRO ADMIN
  // ==============================================================================

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="metallic-card rounded-2xl p-8 md:p-10 border border-amber-500/30 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(234,179,8,0.2)]">
            <ShieldAlert size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase font-display">
              Acesso Administrativo Restrito
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
              Esta área é protegida por Row Level Security (RLS) no servidor. Somente usuários autenticados cadastrados na tabela <code>admin_users</code> possuem permissões de gerência.
            </p>
          </div>

          {user ? (
            <div className="p-5 rounded-xl bg-obsidian-900 border border-white/10 text-left space-y-4 max-w-lg mx-auto">
              <div className="text-xs text-gray-300">
                Você está conectado como: <strong className="text-white">{user.email}</strong>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-2">
                <p className="text-[11px] text-gray-400">
                  Se esta é uma nova instalação e ainda não existe nenhum administrador registrado, você pode reivindicar o primeiro perfil de administrador abaixo:
                </p>

                <button
                  onClick={async () => {
                    const res = await claimInitialAdmin();
                    if (res.success) {
                      showFeedback('success', res.message);
                      await refreshAdminStatus();
                    } else {
                      showFeedback('error', res.message);
                    }
                  }}
                  className="w-full btn-chrome py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Crown size={14} /> Reivindicar Primeiro Administrador
                </button>
              </div>

              <div className="text-[11px] text-gray-500">
                Alternativamente, execute o seguinte comando no SQL Editor do Supabase:
                <pre className="mt-1 p-2 bg-black rounded font-mono text-[10px] text-amber-300 overflow-x-auto">
                  INSERT INTO public.admin_users (user_id) VALUES ('{user.id}');
                </pre>
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <a
                href="/login"
                className="btn-chrome px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
              >
                Fazer Login na Conta de Administrador
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==============================================================================
  // PAINEL ADMINISTRATIVO AUTORIZADO
  // ==============================================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border text-xs flex items-center gap-2.5 transition-all animate-bounce ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Topo do Painel */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
            <Crown size={12} /> Acesso Administrador Liberado
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight font-display">
            Painel de Controle STREETLIFE
          </h1>
          <p className="text-xs text-gray-400">
            Gerenciamento completo das batalhas, pódios, look da semana e registros da comunidade.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllAdminData}
            title="Atualizar dados"
            className="btn-metallic p-2.5 rounded-xl text-xs flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('battles')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'battles'
              ? 'bg-white text-black font-bold shadow-md'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
          }`}
        >
          <Swords size={14} /> Batalhas ({battles.length})
        </button>

        <button
          onClick={() => setActiveTab('champions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'champions'
              ? 'bg-white text-black font-bold shadow-md'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
          }`}
        >
          <Trophy size={14} /> Quadro de Campeões ({results.length})
        </button>

        <button
          onClick={() => setActiveTab('looks')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'looks'
              ? 'bg-white text-black font-bold shadow-md'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
          }`}
        >
          <Layers size={14} /> Looks Cadastrados ({looks.length})
        </button>

        <button
          onClick={() => setActiveTab('lotw')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'lotw'
              ? 'bg-white text-black font-bold shadow-md'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
          }`}
        >
          <Sparkles size={14} /> Look da Semana ({lotwList.length})
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap relative ${
            activeTab === 'notifications'
              ? 'bg-white text-black font-bold shadow-md'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
          }`}
        >
          <Bell size={14} /> Novos Usuários
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold ml-1">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ===================================================================== */}
      {/* ABA 1: GERENCIAMENTO DE BATALHAS */}
      {/* ===================================================================== */}
      {activeTab === 'battles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white uppercase font-display">
                Edições de Batalhas
              </h2>
              <p className="text-xs text-gray-400">
                Cadastre, edite status ou remova edições temáticas de competições.
              </p>
            </div>
            <button
              onClick={handleOpenCreateBattle}
              className="btn-chrome px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus size={14} /> Nova Batalha
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {battles.map((b) => (
              <div key={b.id} className="metallic-card p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-white text-black font-mono text-xs font-bold">
                    ED. #{String(b.edition_number).padStart(2, '0')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                    b.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : b.status === 'voting'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/10 text-gray-300 border border-white/20'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white uppercase truncate">{b.title}</h3>
                  <p className="text-xs font-mono text-gray-400">Tema: {b.theme}</p>
                </div>

                {b.prize_info && (
                  <div className="text-[11px] text-amber-300 font-mono flex items-center gap-1">
                    <Trophy size={12} /> {b.prize_info}
                  </div>
                )}

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditBattle(b)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white"
                      title="Editar Batalha"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'battle', id: b.id, label: b.title })}
                      className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20"
                      title="Excluir Batalha"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('champions');
                      handleOpenCreateResult(b.id);
                    }}
                    className="text-[11px] font-mono text-amber-400 hover:underline flex items-center gap-1"
                  >
                    + Pódio
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 2: QUADRO DE CAMPEÕES (PÓDIO 1º, 2º, 3º) */}
      {/* ===================================================================== */}
      {activeTab === 'champions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white uppercase font-display">
                Pódio e Campeões das Edições
              </h2>
              <p className="text-xs text-gray-400">
                Atribua o 1º, 2º e 3º lugares para as edições de batalhas concluídas.
              </p>
            </div>
            <button
              onClick={() => handleOpenCreateResult()}
              className="btn-chrome px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus size={14} /> Cadastrar Colocação
            </button>
          </div>

          {results.length > 0 ? (
            <div className="space-y-6">
              {results.map(({ battle, results: editionResults }) => (
                <div key={battle.id} className="metallic-card p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-amber-400 text-black font-mono text-xs font-bold">
                        ED. #{String(battle.edition_number).padStart(2, '0')}
                      </span>
                      <h3 className="text-base font-bold text-white uppercase">{battle.title}</h3>
                    </div>
                    <button
                      onClick={() => handleOpenCreateResult(battle.id)}
                      className="text-xs font-mono text-gray-300 hover:text-white flex items-center gap-1"
                    >
                      <Plus size={12} /> Adicionar Colocação
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((place) => {
                      const item = editionResults.find((r) => r.placement === place);
                      return (
                        <div
                          key={place}
                          className={`p-4 rounded-xl border ${
                            place === 1
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                              : place === 2
                              ? 'bg-slate-500/10 border-slate-400/30 text-slate-200'
                              : 'bg-amber-900/10 border-amber-800/30 text-amber-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold uppercase">
                              {place}º Lugar {place === 1 ? '👑 CAMPEÃO' : place === 2 ? '🥈 VICE' : '🥉 BRONZE'}
                            </span>
                            {item && (
                              <button
                                onClick={() => setDeleteConfirm({ type: 'result', id: item.id, label: `${place}º lugar` })}
                                className="text-rose-400 hover:text-rose-300"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>

                          {item ? (
                            <div className="space-y-2">
                              <div className="aspect-video rounded-lg overflow-hidden bg-black/60">
                                <img
                                  src={item.look_image_url}
                                  alt={item.participant_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-xs font-bold text-white uppercase truncate">
                                @{item.participant_name}
                              </div>
                              {item.look_title && (
                                <div className="text-[11px] text-gray-300 truncate">
                                  {item.look_title}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="py-6 text-center text-xs text-gray-500 italic">
                              Não definido
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-400 metallic-card rounded-2xl border border-dashed border-white/10">
              Nenhuma colocação cadastrada ainda. Clique em "Cadastrar Colocação" acima para iniciar o pódio.
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 3: LOOKS DA COMUNIDADE */}
      {/* ===================================================================== */}
      {activeTab === 'looks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white uppercase font-display">
                Looks Cadastrados
              </h2>
              <p className="text-xs text-gray-400">
                Gerencie todos os looks da comunidade, adicione novos ou remova registros.
              </p>
            </div>
            <button
              onClick={handleOpenCreateLook}
              className="btn-chrome px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus size={14} /> Adicionar Look
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {looks.map((l) => (
              <div key={l.id} className="metallic-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between">
                <div className="aspect-[3/4] relative bg-obsidian-900">
                  <img
                    src={l.image_url}
                    alt={l.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => handleOpenEditLook(l)}
                      className="p-1.5 rounded-md bg-black/80 backdrop-blur text-white hover:text-sky-300"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'look', id: l.id, label: l.title })}
                      className="p-1.5 rounded-md bg-black/80 backdrop-blur text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 space-y-1">
                  <div className="text-[10px] font-mono text-gray-400 truncate">
                    @{l.participant_name}
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase truncate">{l.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 4: LOOK DA SEMANA */}
      {/* ===================================================================== */}
      {activeTab === 'lotw' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white uppercase font-display">
                Look da Semana
              </h2>
              <p className="text-xs text-gray-400">
                Seleção editorial semanal destacada na Home e na página própria.
              </p>
            </div>
            <button
              onClick={handleOpenCreateLotw}
              className="btn-chrome px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus size={14} /> Consagrar Look da Semana
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lotwList.map((item) => (
              <div
                key={item.id}
                className={`metallic-card p-5 rounded-2xl border ${
                  item.is_active ? 'border-sky-400/40 bg-sky-950/10' : 'border-white/10'
                } flex gap-4`}
              >
                <div className="w-28 aspect-[3/4] rounded-xl overflow-hidden bg-obsidian-900 shrink-0">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-400 uppercase">
                        {item.highlight_period}
                      </span>
                      {item.is_active && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          ATIVO
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase mt-1">{item.title}</h3>
                    <div className="text-xs font-mono text-gray-400">@{item.author_name}</div>
                    <p className="text-xs text-gray-300 italic line-clamp-2 mt-1">
                      "{item.curator_comment}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditLotw(item)}
                        className="text-xs text-gray-300 hover:text-white"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'lotw', id: item.id, label: item.title })}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {!item.is_active && (
                      <button
                        onClick={async () => {
                          await lookOfTheWeekService.update(item.id, { is_active: true });
                          showFeedback('success', 'Look redefinido como ativo da semana!');
                          loadAllAdminData();
                        }}
                        className="text-[11px] font-mono text-sky-400 hover:underline"
                      >
                        Tornar Ativo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 5: NOVOS USUÁRIOS (REALTIME & NOTIFICAÇÕES) */}
      {/* ===================================================================== */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white uppercase font-display">
                  Novos Usuários Registrados
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500 text-white">
                    {unreadCount} não visualizados
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Notificações geradas automaticamente por trigger no banco após cada cadastro. Atualizado em tempo real.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={requestNotificationPermission}
                className="btn-metallic px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5"
              >
                <Radio size={13} className={browserNotificationPerm === 'granted' ? 'text-emerald-400' : 'text-amber-400'} />
                {browserNotificationPerm === 'granted' ? 'Alertas Web Ativos' : 'Ativar Alertas no Navegador'}
              </button>

              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="btn-metallic px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 disabled:opacity-40"
              >
                <Check size={13} /> Marcar Todos como Lidos
              </button>
            </div>
          </div>

          {/* Nota de Privacidade & Funcionamento */}
          <div className="p-4 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-gray-400 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <ShieldAlert size={14} className="text-amber-400" />
              Privacidade & Notificações em Tempo Real:
            </div>
            <p>
              • <strong>Privacidade:</strong> Somente administradores autorizados com papel validado via RLS têm permissão para consultar os e-mails desta lista. Usuários comuns não possuem acesso de leitura a esta tabela.
            </p>
            <p>
              • <strong>Alertas do Navegador:</strong> Funcionam enquanto a aba da STREETLIFE estiver aberta em segundo plano. Alertas com o navegador completamente fechado exigiriam push service workers e chaves VAPID dedicadas de servidor.
            </p>
          </div>

          {/* Lista de Notificações */}
          {notifications.length > 0 ? (
            <div className="metallic-card rounded-2xl overflow-hidden border border-white/10 divide-y divide-white/5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    !n.is_read ? 'bg-white/[0.04]' : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        !n.is_read ? 'bg-rose-500 animate-pulse' : 'bg-gray-600'
                      }`}
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-white">
                        {n.email}
                      </div>
                      <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2">
                        <span>ID: {n.user_id.slice(0, 8)}...</span>
                        <span>•</span>
                        <span>{new Date(n.created_at).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="px-3 py-1 rounded-lg text-xs font-mono bg-white/10 hover:bg-white/20 text-white flex items-center gap-1"
                      >
                        <Check size={12} /> Marcar como lido
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm({ type: 'notification', id: n.id, label: n.email })}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="metallic-card p-8 rounded-2xl text-center text-xs text-gray-400 border border-dashed border-white/10">
              Nenhuma notificação de usuário registrada até o momento.
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DE CRIAÇÃO/EDIÇÃO DE BATALHA */}
      {/* ===================================================================== */}
      {battleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="metallic-card w-full max-w-xl rounded-2xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto space-y-4 relative">
            <button
              onClick={() => setBattleModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white uppercase">
              {editingBattle ? 'Editar Batalha' : 'Nova Batalha Temática'}
            </h2>

            <form onSubmit={handleSaveBattle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                    Número da Edição
                  </label>
                  <input
                    type="number"
                    value={battleForm.edition_number}
                    onChange={(e) => setBattleForm({ ...battleForm, edition_number: Number(e.target.value) })}
                    className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                    Status da Edição
                  </label>
                  <select
                    value={battleForm.status}
                    onChange={(e) => setBattleForm({ ...battleForm, status: e.target.value as Battle['status'] })}
                    className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="active">Ativa / Inscrições Abertas</option>
                    <option value="voting">Em Votação</option>
                    <option value="completed">Concluída</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Título da Batalha
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cyber Techwear vs Heavy Denim"
                  value={battleForm.title}
                  onChange={(e) => setBattleForm({ ...battleForm, title: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Tema Central
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sportlife & Tech Futurista"
                  value={battleForm.theme}
                  onChange={(e) => setBattleForm({ ...battleForm, theme: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  URL da Capa
                </label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/capa.jpg"
                  value={battleForm.cover_image_url}
                  onChange={(e) => setBattleForm({ ...battleForm, cover_image_url: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Premiação Oficial
                </label>
                <input
                  type="text"
                  placeholder="Ex: R$ 2.000 + Drop Exclusivo + Destaque Permanente"
                  value={battleForm.prize_info}
                  onChange={(e) => setBattleForm({ ...battleForm, prize_info: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Descrição e Instruções
                </label>
                <textarea
                  rows={3}
                  value={battleForm.description}
                  onChange={(e) => setBattleForm({ ...battleForm, description: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setBattleModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-chrome px-5 py-2 rounded-xl text-xs font-bold uppercase"
                >
                  {actionLoading ? 'Salvando...' : 'Salvar Batalha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DE RESULTADO / PÓDIO DE CAMPEÕES */}
      {/* ===================================================================== */}
      {resultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="metallic-card w-full max-w-lg rounded-2xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto space-y-4 relative">
            <button
              onClick={() => setResultModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white uppercase">
              Registrar Colocação do Pódio
            </h2>

            <form onSubmit={handleSaveResult} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Edição da Batalha
                </label>
                <select
                  value={resultForm.battle_id}
                  onChange={(e) => setResultForm({ ...resultForm, battle_id: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                >
                  {battles.map((b) => (
                    <option key={b.id} value={b.id}>
                      ED. #{b.edition_number} — {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Posição no Pódio
                </label>
                <select
                  value={resultForm.placement}
                  onChange={(e) => setResultForm({ ...resultForm, placement: Number(e.target.value) as 1 | 2 | 3 })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value={1}>1º Lugar — Campeão</option>
                  <option value={2}>2º Lugar — Vice-Campeão</option>
                  <option value={3}>3º Lugar — Bronze</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Nome / @Nick do Participante
                </label>
                <input
                  type="text"
                  placeholder="Ex: @kai_street"
                  value={resultForm.participant_name}
                  onChange={(e) => setResultForm({ ...resultForm, participant_name: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Título do Look
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cyber Tracksuit & TN Platinum"
                  value={resultForm.look_title}
                  onChange={(e) => setResultForm({ ...resultForm, look_title: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  URL da Foto do Look Vencedor
                </label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/look.jpg"
                  value={resultForm.look_image_url}
                  onChange={(e) => setResultForm({ ...resultForm, look_image_url: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Observações / Parecer da Vitória
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Destaque pelo caimento impecável e harmonia de proporções."
                  value={resultForm.custom_notes}
                  onChange={(e) => setResultForm({ ...resultForm, custom_notes: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setResultModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-chrome px-5 py-2 rounded-xl text-xs font-bold uppercase"
                >
                  {actionLoading ? 'Salvando...' : 'Salvar Colocação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DE CRIAÇÃO/EDIÇÃO DE LOOK */}
      {/* ===================================================================== */}
      {lookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="metallic-card w-full max-w-lg rounded-2xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto space-y-4 relative">
            <button
              onClick={() => setLookModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white uppercase">
              {editingLook ? 'Editar Look' : 'Adicionar Look Administrativo'}
            </h2>

            <form onSubmit={handleSaveLook} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Nome do Participante (@Nick)
                </label>
                <input
                  type="text"
                  value={lookForm.participant_name}
                  onChange={(e) => setLookForm({ ...lookForm, participant_name: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Título do Look
                </label>
                <input
                  type="text"
                  value={lookForm.title}
                  onChange={(e) => setLookForm({ ...lookForm, title: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  URL da Foto
                </label>
                <input
                  type="url"
                  value={lookForm.image_url}
                  onChange={(e) => setLookForm({ ...lookForm, image_url: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Tags de Estilo (vírgula)
                </label>
                <input
                  type="text"
                  value={lookForm.style_tags}
                  onChange={(e) => setLookForm({ ...lookForm, style_tags: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Batalha Associada (Opcional)
                </label>
                <select
                  value={lookForm.battle_id}
                  onChange={(e) => setLookForm({ ...lookForm, battle_id: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="">Nenhuma / Apenas Galeria</option>
                  {battles.map((b) => (
                    <option key={b.id} value={b.id}>
                      ED. #{b.edition_number} — {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setLookModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-chrome px-5 py-2 rounded-xl text-xs font-bold uppercase"
                >
                  {actionLoading ? 'Salvando...' : 'Salvar Look'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DE CRIAÇÃO/EDIÇÃO DE LOOK DA SEMANA */}
      {/* ===================================================================== */}
      {lotwModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="metallic-card w-full max-w-lg rounded-2xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto space-y-4 relative">
            <button
              onClick={() => setLotwModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white uppercase">
              {editingLotw ? 'Editar Look da Semana' : 'Novo Look da Semana'}
            </h2>

            <form onSubmit={handleSaveLotw} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Título do Look
                </label>
                <input
                  type="text"
                  placeholder="Ex: Minimalist Monochrome Trench"
                  value={lotwForm.title}
                  onChange={(e) => setLotwForm({ ...lotwForm, title: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Autor / @Nick
                </label>
                <input
                  type="text"
                  placeholder="Ex: @lucas_dripmaster"
                  value={lotwForm.author_name}
                  onChange={(e) => setLotwForm({ ...lotwForm, author_name: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  URL da Foto
                </label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={lotwForm.image_url}
                  onChange={(e) => setLotwForm({ ...lotwForm, image_url: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Período de Destaque
                </label>
                <input
                  type="text"
                  placeholder="Ex: 19 a 26 de Outubro de 2026"
                  value={lotwForm.highlight_period}
                  onChange={(e) => setLotwForm({ ...lotwForm, highlight_period: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Parecer da Curadoria
                </label>
                <textarea
                  rows={3}
                  placeholder="Justifique a escolha do look da semana..."
                  value={lotwForm.curator_comment}
                  onChange={(e) => setLotwForm({ ...lotwForm, curator_comment: e.target.value })}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={lotwForm.is_active}
                  onChange={(e) => setLotwForm({ ...lotwForm, is_active: e.target.checked })}
                  className="rounded border-white/20 bg-obsidian-900"
                />
                <label htmlFor="activeCheck" className="text-xs font-mono text-white">
                  Definir como Look Ativo da Semana (substitui o anterior)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setLotwModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-chrome px-5 py-2 rounded-xl text-xs font-bold uppercase"
                >
                  {actionLoading ? 'Salvando...' : 'Salvar Look da Semana'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {/* ===================================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="metallic-card w-full max-w-sm rounded-2xl border border-rose-500/30 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase">Confirmar Exclusão</h3>
              <p className="text-xs text-gray-400 mt-1">
                Tem certeza que deseja excluir <strong>{deleteConfirm.label}</strong>? Esta ação é irreversível no Supabase.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold uppercase bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                {actionLoading ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
