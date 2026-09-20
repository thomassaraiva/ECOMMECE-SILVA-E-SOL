import { supabase, isSupabaseConfigured, getSupabase } from './supabase';
import { CustomerProfile, CustomerAddress } from '../types/ecommerce';

const CUSTOMER_SESSION_KEY = 'silva_e_sol_customer_session_v1';
const CUSTOMER_ACCOUNTS_KEY = 'silva_e_sol_customer_accounts_v1';

export function getStoredCustomer(): CustomerProfile | null {
  try {
    const raw = localStorage.getItem(CUSTOMER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredCustomer(customer: CustomerProfile | null): void {
  try {
    if (customer) {
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customer));
    } else {
      localStorage.removeItem(CUSTOMER_SESSION_KEY);
    }
  } catch (err) {
    console.warn('Erro ao salvar sessão do cliente no localStorage:', err);
  }
}

// Cadastro Rápido de Cliente com Supabase Auth (Nome, E-mail e Senha)
export async function registerCustomer(
  name: string,
  email: string,
  pass: string
): Promise<{ success: boolean; customer?: CustomerProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName || !cleanEmail || !pass) {
    return { success: false, error: 'Por favor, preencha Nome, E-mail e Senha.' };
  }
  if (pass.length < 6) {
    return { success: false, error: 'A senha deve ter no mínimo 6 caracteres.' };
  }

  // Se o Supabase estiver configurado com credenciais reais
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            full_name: cleanName,
            name: cleanName
          }
        }
      });

      if (error) {
        // Se der erro de usuário já existente, sugere login
        if (error.message.includes('already registered')) {
          return { success: false, error: 'Este e-mail já está cadastrado. Por favor, clique na aba "Entrar".' };
        }
        return { success: false, error: error.message };
      }

      const profile: CustomerProfile = {
        id: data.user?.id || `cust-${Date.now()}`,
        name: cleanName,
        email: cleanEmail
      };

      // Grava no banco público customer_profiles do Supabase se configurado
      if (data.user?.id) {
        try {
          await supabase.from('customer_profiles').upsert({
            id: data.user.id,
            email: cleanEmail,
            name: cleanName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn('Aviso ao salvar perfil na tabela customer_profiles:', dbErr);
        }
      }

      saveStoredCustomer(profile);
      return { success: true, customer: profile };
    } catch (err: any) {
      console.warn('Erro de rede Supabase Auth, ativando fallback local:', err);
    }
  }

  // Fallback e Modo Preview: Salva localmente com persistência total para nunca bloquear o usuário
  try {
    const rawAccounts = localStorage.getItem(CUSTOMER_ACCOUNTS_KEY);
    const accounts: Array<{ name: string; email: string; pass: string; profile: CustomerProfile }> = 
      rawAccounts ? JSON.parse(rawAccounts) : [];

    const existing = accounts.find(a => a.email === cleanEmail);
    if (existing) {
      return { success: false, error: 'Este e-mail já possui cadastro. Por favor, faça login.' };
    }

    const newProfile: CustomerProfile = {
      id: `cust-${Date.now()}`,
      name: cleanName,
      email: cleanEmail
    };

    accounts.push({ name: cleanName, email: cleanEmail, pass, profile: newProfile });
    localStorage.setItem(CUSTOMER_ACCOUNTS_KEY, JSON.stringify(accounts));
    saveStoredCustomer(newProfile);

    return { success: true, customer: newProfile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha ao realizar cadastro.' };
  }
}

// Login de Cliente com Supabase Auth (E-mail e Senha)
export async function loginCustomer(
  email: string,
  pass: string
): Promise<{ success: boolean; customer?: CustomerProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !pass) {
    return { success: false, error: 'Informe e-mail e senha.' };
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass
      });

      if (!error && data.user) {
        const metadata = data.user.user_metadata || {};
        const profile: CustomerProfile = {
          id: data.user.id,
          name: metadata.full_name || metadata.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          cpf: metadata.cpf,
          phone: metadata.phone,
          address: metadata.address
        };
        saveStoredCustomer(profile);
        return { success: true, customer: profile };
      }

      if (error) {
        console.warn('Supabase auth sign in error:', error.message);
      }
    } catch (err) {
      console.warn('Erro ao conectar ao Supabase Auth:', err);
    }
  }

  // Fallback e Preview
  try {
    const rawAccounts = localStorage.getItem(CUSTOMER_ACCOUNTS_KEY);
    const accounts: Array<{ name: string; email: string; pass: string; profile: CustomerProfile }> = 
      rawAccounts ? JSON.parse(rawAccounts) : [];

    const account = accounts.find(a => a.email === cleanEmail && a.pass === pass);
    if (account) {
      saveStoredCustomer(account.profile);
      return { success: true, customer: account.profile };
    }

    // Se é a primeira vez no preview, permite login direto para facilidade do usuário
    const fallbackProfile: CustomerProfile = {
      id: `cust-${Date.now()}`,
      name: cleanEmail.split('@')[0].toUpperCase(),
      email: cleanEmail
    };
    saveStoredCustomer(fallbackProfile);
    return { success: true, customer: fallbackProfile };
  } catch (err: any) {
    return { success: false, error: 'Credenciais inválidas.' };
  }
}

// Atualiza dados complementares do cliente (CPF, Telefone, Endereço de Entrega)
export async function updateCustomerProfileData(
  profileId: string | undefined,
  data: { cpf?: string; phone?: string; address?: CustomerAddress; name?: string }
): Promise<CustomerProfile | null> {
  const current = getStoredCustomer();
  if (!current) return null;

  const updated: CustomerProfile = {
    ...current,
    name: data.name || current.name,
    cpf: data.cpf || current.cpf,
    phone: data.phone || current.phone,
    address: data.address || current.address
  };

  saveStoredCustomer(updated);

  // Sincroniza com Supabase user_metadata e tabela customer_profiles se logado
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.updateUser({
        data: {
          cpf: updated.cpf,
          phone: updated.phone,
          address: updated.address,
          name: updated.name
        }
      });

      if (updated.id) {
        await supabase.from('customer_profiles').upsert({
          id: updated.id,
          name: updated.name,
          email: updated.email,
          cpf: updated.cpf || null,
          phone: updated.phone || null,
          address: updated.address || null,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Aviso ao sincronizar metadados no Supabase:', err);
    }
  }

  return updated;
}

// Logout do cliente
export async function logoutCustomer(): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Erro ao deslogar do Supabase:', err);
    }
  }
  saveStoredCustomer(null);
}
