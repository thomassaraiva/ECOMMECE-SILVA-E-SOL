import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

interface AdminUser {
  email: string;
  role: 'admin' | 'owner';
  username?: string;
}

export interface StoredCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  login: (emailOrUser: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetCredentials: (newUsername: string, newPassword: string) => { success: boolean; message: string };
  currentCredentials: StoredCredentials;
  isUsingSupabaseAuth: boolean;
  bypassLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_SESSION_KEY = 'silva_e_sol_admin_session_v1';
const CUSTOM_CREDS_KEY = 'silva_e_sol_admin_creds_v2';

// Credenciais padrão simplificadas e acessíveis
const DEFAULT_CREDENTIALS: StoredCredentials = {
  username: 'admin',
  password: 'admin123'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentCredentials, setCurrentCredentials] = useState<StoredCredentials>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_CREDS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.username && parsed.password) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao ler credenciais personalizadas:', e);
    }
    return DEFAULT_CREDENTIALS;
  });

  const isAuthenticated = Boolean(adminUser);
  const isUsingSupabaseAuth = isSupabaseConfigured;

  useEffect(() => {
    // Se o Supabase estiver configurado, escuta mudanças de estado de auth
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const user: AdminUser = { 
            email: session.user.email || 'admin@silvaesol.com.br', 
            role: 'admin',
            username: session.user.email?.split('@')[0] || 'admin'
          };
          setAdminUser(user);
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
        }
      }).catch(e => console.warn('Supabase session check:', e));

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const user: AdminUser = { 
            email: session.user.email || 'admin@silvaesol.com.br', 
            role: 'admin',
            username: session.user.email?.split('@')[0] || 'admin'
          };
          setAdminUser(user);
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Função para redefinir usuário e senha a qualquer momento
  const resetCredentials = (newUsername: string, newPassword: string): { success: boolean; message: string } => {
    const cleanUser = newUsername.trim();
    const cleanPass = newPassword.trim();

    if (!cleanUser || cleanUser.length < 3) {
      return { success: false, message: 'O nome de usuário deve ter no mínimo 3 caracteres.' };
    }
    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, message: 'A nova senha deve ter no mínimo 4 caracteres.' };
    }

    const updated: StoredCredentials = {
      username: cleanUser,
      password: cleanPass
    };

    localStorage.setItem(CUSTOM_CREDS_KEY, JSON.stringify(updated));
    setCurrentCredentials(updated);
    return { success: true, message: `Credenciais redefinidas com sucesso! Novo usuário: "${cleanUser}".` };
  };

  // Login direto (1 clique para desenvolvimento e emergência)
  const bypassLogin = () => {
    const user: AdminUser = {
      email: `${currentCredentials.username}@silvaesol.com.br`,
      role: 'owner',
      username: currentCredentials.username
    };
    setAdminUser(user);
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
  };

  const login = async (emailOrUser: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanInput = emailOrUser.trim().toLowerCase();
    const rawPass = pass.trim();

    if (!cleanInput || !rawPass) {
      return { success: false, error: 'Por favor, informe o usuário/e-mail e a senha.' };
    }

    // 1. Tentar primeiro com Supabase (se configurado com chaves reais)
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanInput,
          password: rawPass
        });
        if (!error && data.user) {
          const user: AdminUser = { 
            email: data.user.email || cleanInput, 
            role: 'admin',
            username: data.user.email?.split('@')[0] || 'admin'
          };
          setAdminUser(user);
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Tentativa Supabase falhou, tentando credenciais administrativas locais:', err);
      }
    }

    // 2. Validação com as Credenciais Definidas pelo Usuário no LocalStorage
    const customUserMatch = cleanInput === currentCredentials.username.toLowerCase();
    const customPassMatch = rawPass === currentCredentials.password;

    if (customUserMatch && customPassMatch) {
      const user: AdminUser = {
        email: cleanInput.includes('@') ? cleanInput : `${currentCredentials.username}@silvaesol.com.br`,
        role: 'owner',
        username: currentCredentials.username
      };
      setAdminUser(user);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
      return { success: true };
    }

    // 3. Fallbacks de fábrica aceitos (para garantir que você NUNCA fique bloqueado)
    const validUsernames = [
      'admin',
      'silvaesol',
      'silva',
      'silva e sol',
      'thomascorreia66@gmail.com',
      'admin@silvaesol.com.br',
      'silvaesol@silvaesol.com.br',
      'contato@silvaesol.com.br'
    ];

    const validPasswords = [
      'admin123',
      'admin',
      'silva123',
      'silvaesol',
      'silvaesol2025',
      '123456',
      'Silva&s0l',
      'Silva&sol',
      'silva&sol',
      'silva&s0l'
    ];

    const isUserAllowed = validUsernames.some(u => u.toLowerCase() === cleanInput);
    const isPassAllowed = validPasswords.some(p => p === rawPass);

    if (isUserAllowed && isPassAllowed) {
      const user: AdminUser = { 
        email: cleanInput.includes('@') ? cleanInput : 'admin@silvaesol.com.br', 
        role: 'owner',
        username: cleanInput.split('@')[0] || 'admin'
      };
      setAdminUser(user);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
      return { success: true };
    }

    return { 
      success: false, 
      error: 'Usuário ou senha incorretos. Verifique suas credenciais de acesso.' 
    };
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Erro ao deslogar do Supabase:', e);
      }
    }
    setAdminUser(null);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        adminUser,
        login,
        logout,
        resetCredentials,
        currentCredentials,
        isUsingSupabaseAuth,
        bypassLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
