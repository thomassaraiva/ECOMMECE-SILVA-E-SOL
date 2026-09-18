import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Shield, 
  AlertCircle, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  LogIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export const AdminLogin: React.FC = () => {
  const { login, isUsingSupabaseAuth } = useAuth();
  const { setCurrentPage } = useStore();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const result = await login(usernameInput, passwordInput);
      if (result.success) {
        setCurrentPage('admin-panel');
      } else {
        setErrorMsg(result.error || 'Usuário ou senha incorretos.');
      }
    } catch (err: any) {
      setErrorMsg('Falha ao autenticar: ' + (err.message || 'Erro inesperado.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-stone-950 text-stone-100">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Voltar à loja */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage('home')}
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#2A8882] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para a Loja</span>
          </button>

          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            isUsingSupabaseAuth
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
              : 'bg-teal-950/60 text-[#2A8882] border-teal-800/60'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isUsingSupabaseAuth ? 'bg-emerald-400' : 'bg-[#2A8882]'}`} />
            {isUsingSupabaseAuth ? 'Supabase Conectado' : 'Acesso Restrito'}
          </span>
        </div>

        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2A8882]/30 to-[#F4803E]/20 text-[#2A8882] border border-[#2A8882]/30 flex items-center justify-center mx-auto shadow-inner">
            <Shield className="w-7 h-7 text-[#2A8882]" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-stone-100 tracking-tight">
            Painel Administrativo
          </h1>
          <p className="text-xs text-stone-400 max-w-xs mx-auto">
            Área de acesso restrito para gestão da SILVA E SOL.
          </p>
        </div>

        {/* Notificações de Erro */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Formulário de Login Seguro */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Usuário ou E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                autoComplete="username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Digite seu usuário ou e-mail"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs sm:text-sm placeholder-stone-600 focus:outline-none focus:border-[#2A8882]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs sm:text-sm placeholder-stone-600 focus:outline-none focus:border-[#2A8882]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-500 hover:text-stone-300 cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Ver senha digitada'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'Verificando...' : 'Entrar no Painel'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[11px] text-stone-500">
            Ambiente seguro com criptografia e proteção de dados.
          </p>
        </div>

      </div>
    </div>
  );
};
