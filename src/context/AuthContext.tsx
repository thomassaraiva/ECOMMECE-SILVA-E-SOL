import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';

type MfaStep = 'none' | 'enroll' | 'verify';
type Result = { success: boolean; error?: string };

interface AuthContextType {
  adminUser: { email: string } | null;
  isAuthenticated: boolean;
  mfaStep: MfaStep;
  mfaEnrollment: { qrCode: string; secret: string } | null;
  login: (email: string, password: string) => Promise<Result>;
  verifyMfa: (code: string) => Promise<Result>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<{ email: string } | null>(null);
  const [mfaStep, setMfaStep] = useState<MfaStep>('none');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [mfaEnrollment, setMfaEnrollment] = useState<{ qrCode: string; secret: string } | null>(null);

  const supabase = getSupabase();

  const resetState = () => {
    setAdminUser(null);
    setMfaStep('none');
    setFactorId(null);
    setMfaEnrollment(null);
  };

  const confirmAdmin = async (email: string): Promise<boolean> => {
    if (!supabase) return false;
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel !== 'aal2') return false;
    const { data: isAdmin, error } = await supabase.rpc('is_admin');
    if (error || isAdmin !== true) return false;
    setAdminUser({ email });
    return true;
  };

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email) await confirmAdmin(session.user.email);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') resetState();
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<Result> => {
    if (!supabase) return { success: false, error: 'O painel não está configurado.' };
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return { success: false, error: 'Informe o e-mail e a senha.' };

    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error || !data.user) return { success: false, error: 'E-mail ou senha incorretos.' };

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === 'aal2') {
      if (await confirmAdmin(cleanEmail)) return { success: true };
      await supabase.auth.signOut();
      resetState();
      return { success: false, error: 'Esta conta não tem acesso ao painel.' };
    }

    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) return { success: false, error: 'Não foi possível verificar sua conta. Tente de novo.' };
    const verified = factors?.totp?.find((f: any) => f.status === 'verified');
    if (verified) {
      setFactorId(verified.id);
      setMfaStep('verify');
      return { success: true };
    }

    // Cadastros de aplicativo abandonados impedem um novo cadastro
    for (const f of factors?.all ?? []) {
      if (f.status === 'unverified') await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data: enrolled, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Painel Silva e Sol',
    });
    if (enrollError || !enrolled) return { success: false, error: 'Não foi possível iniciar a verificação em duas etapas.' };
    setFactorId(enrolled.id);
    setMfaEnrollment({ qrCode: enrolled.totp.qr_code, secret: enrolled.totp.secret });
    setMfaStep('enroll');
    return { success: true };
  };

  const verifyMfa = async (code: string): Promise<Result> => {
    if (!supabase || !factorId) return { success: false, error: 'Faça o login de novo.' };
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
    if (error) return { success: false, error: 'Código inválido. Confira o aplicativo e tente de novo.' };

    const { data } = await supabase.auth.getSession();
    const email = data.session?.user?.email ?? '';
    if (await confirmAdmin(email)) {
      setMfaStep('none');
      setMfaEnrollment(null);
      return { success: true };
    }
    await supabase.auth.signOut();
    resetState();
    return { success: false, error: 'Esta conta não tem acesso ao painel.' };
  };

  const logout = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      // Sem resposta do servidor, ao menos apaga a sessão guardada neste navegador
      if (error) await supabase.auth.signOut({ scope: 'local' });
    }
    resetState();
  };

  return (
    <AuthContext.Provider
      value={{ adminUser, isAuthenticated: Boolean(adminUser), mfaStep, mfaEnrollment, login, verifyMfa, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
};
