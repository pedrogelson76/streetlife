import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, getSupabaseConfig } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  claimInitialAdmin: () => Promise<{ success: boolean; message: string }>;
  refreshAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const config = getSupabaseConfig();
  const [isConfigured] = useState<boolean>(config.isConfigured);

  // Validação segura no backend do status de administrador
  const verifyAdminStatus = async (userId: string | undefined): Promise<boolean> => {
    if (!userId || !config.isConfigured) return false;

    try {
      // 1. Tenta via RPC is_admin
      const { data: rpcData, error: rpcError } = await supabase.rpc('is_admin', {
        check_user_id: userId,
      });

      if (!rpcError && typeof rpcData === 'boolean') {
        return rpcData;
      }

      // 2. Fallback direto na tabela admin_users com RLS
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  const refreshAdminStatus = async () => {
    if (user) {
      const adminCheck = await verifyAdminStatus(user.id);
      setIsAdmin(adminCheck);
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    if (!config.isConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Obtém sessão inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const admin = await verifyAdminStatus(session.user.id);
        if (mounted) setIsAdmin(admin);
      }
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // Escuta alterações de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const admin = await verifyAdminStatus(session.user.id);
        if (mounted) setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [config.isConfigured]);

  const signUp = async (email: string, password: string) => {
    if (!config.isConfigured) {
      return { success: false, error: 'Supabase não configurado. Adicione suas credenciais no arquivo .env ou no painel de configuração.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user && !data.session) {
        return {
          success: true,
          message: 'Cadastro realizado! Por favor, verifique a caixa de entrada do seu e-mail para confirmar a conta antes de fazer login.',
        };
      }

      return { success: true, message: 'Conta criada com sucesso!' };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao cadastrar.' };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!config.isConfigured) {
      return { success: false, error: 'Supabase não configurado. Por favor, conecte seu projeto primeiro.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const admin = await verifyAdminStatus(data.user.id);
        setIsAdmin(admin);
      }

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Falha na autenticação.' };
    }
  };

  const signOut = async () => {
    if (config.isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  const claimInitialAdmin = async (): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Você precisa estar logado para se registrar como primeiro admin.' };
    }

    try {
      // Chama a função SQL de bootstrap seguro
      const { data, error } = await supabase.rpc('claim_initial_admin');
      
      if (error) {
        return { success: false, message: error.message };
      }

      if (data === true) {
        setIsAdmin(true);
        return { success: true, message: 'Parabéns! Sua conta foi consagrada como Primeiro Administrador da STREETLIFE.' };
      } else {
        return { success: false, message: 'A plataforma já possui administradores registrados. Novos administradores devem ser adicionados diretamente no banco de dados por segurança.' };
      }
    } catch (err: unknown) {
      return { success: false, message: err instanceof Error ? err.message : 'Erro ao reivindicar perfil de administrador.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        isConfigured,
        signUp,
        signIn,
        signOut,
        claimInitialAdmin,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
