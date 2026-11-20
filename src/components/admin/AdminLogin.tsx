import React, { useEffect, useState } from 'react';
import {
  Lock,
  Mail,
  Shield,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  LogIn,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

const inputClass =
  'w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs sm:text-sm placeholder-stone-600 focus:outline-none focus:border-[#2A8882]';
const buttonClass =
  'w-full py-3 px-4 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2';

export const AdminLogin: React.FC = () => {
  const { login, verifyMfa, mfaStep, mfaEnrollment, isAuthenticated } = useAuth();
  const { setCurrentPage } = useStore();

  // Sessão já confirmada (aal2 + administrador): vai direto para o painel
  useEffect(() => {
    if (isAuthenticated) setCurrentPage('admin-panel');
  }, [isAuthenticated]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (!result.success) setErrorMsg(result.error || 'E-mail ou senha incorretos.');
      else setPassword('');
    } catch {
      setErrorMsg('Não foi possível entrar agora. Tente de novo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const result = await verifyMfa(code);
      if (result.success) {
        setCurrentPage('admin-panel');
      } else {
        setErrorMsg(result.error || 'Código inválido. Confira o aplicativo e tente de novo.');
        setCode('');
      }
    } catch {
      setErrorMsg('Não foi possível confirmar o código agora. Tente de novo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorBox = errorMsg && (
    <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
      <p role="alert" className="flex-1">{errorMsg}</p>
    </div>
  );

  const codeForm = (
    <form onSubmit={handleVerify} className="space-y-4">
      <div>
        <label htmlFor="mfa-code" className="block text-xs font-semibold text-stone-300 mb-1.5">
          Código
        </label>
        <div className="relative">
          <KeyRound className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" aria-hidden="true" />
          <input
            id="mfa-code"
            type="text"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className={`${inputClass} tracking-[0.3em]`}
          />
        </div>
      </div>
      <button type="submit" disabled={isSubmitting} className={buttonClass}>
        <Shield className="w-4 h-4" aria-hidden="true" />
        <span>{isSubmitting ? 'Confirmando...' : 'Confirmar'}</span>
      </button>
    </form>
  );

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-stone-950 text-stone-100">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">

        {/* Voltar à loja */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage('home')}
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#2A8882] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Voltar para a Loja</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-teal-950/60 text-[#2A8882] border-teal-800/60">
            <span className="w-2 h-2 rounded-full bg-[#2A8882]" />
            Acesso Restrito
          </span>
        </div>

        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2A8882]/30 to-[#F4803E]/20 text-[#2A8882] border border-[#2A8882]/30 flex items-center justify-center mx-auto shadow-inner">
            <Shield className="w-7 h-7 text-[#2A8882]" aria-hidden="true" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-stone-100 tracking-tight">
            Painel Administrativo
          </h1>
          <p className="text-xs text-stone-400 max-w-xs mx-auto">
            Área de acesso restrito para gestão da SILVA E SOL.
          </p>
        </div>

        {mfaStep === 'none' && (
          <>
            {errorBox}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-xs font-semibold text-stone-300 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" aria-hidden="true" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" aria-hidden="true" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-500 hover:text-stone-300 cursor-pointer"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className={buttonClass}>
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span>{isSubmitting ? 'Verificando...' : 'Entrar'}</span>
              </button>
            </form>
          </>
        )}

        {mfaStep === 'enroll' && mfaEnrollment && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-lg text-stone-100 text-center">
              Ative a verificação em duas etapas
            </h2>
            <p className="text-xs text-stone-300 text-center">
              Abra o Google Authenticator, Microsoft Authenticator ou outro aplicativo autenticador e leia o QR code.
            </p>
            <img
              src={mfaEnrollment.qrCode}
              alt="QR code para cadastrar o painel no aplicativo autenticador"
              className="mx-auto h-48 w-48 rounded-lg bg-white p-2"
            />
            <p className="text-xs text-stone-400 text-center">
              Não consegue ler? Digite esta chave no aplicativo:{' '}
              <code className="block mt-1 break-all font-mono text-stone-100">{mfaEnrollment.secret}</code>
            </p>
            {errorBox}
            {codeForm}
          </div>
        )}

        {mfaStep === 'verify' && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-lg text-stone-100 text-center">
              Verificação em duas etapas
            </h2>
            <p className="text-xs text-stone-300 text-center">
              Digite o código de 6 dígitos do seu aplicativo autenticador.
            </p>
            {errorBox}
            {codeForm}
          </div>
        )}

        <div className="text-center pt-2">
          <p className="text-[11px] text-stone-500">
            Ambiente seguro com criptografia e proteção de dados.
          </p>
        </div>

      </div>
    </div>
  );
};
