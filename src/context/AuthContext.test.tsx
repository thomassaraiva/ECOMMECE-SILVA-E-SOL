import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';

const auth = {
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  mfa: {
    getAuthenticatorAssuranceLevel: vi.fn(),
    listFactors: vi.fn(),
    enroll: vi.fn(),
    unenroll: vi.fn(),
    challengeAndVerify: vi.fn(),
  },
};
const rpc = vi.fn();

vi.mock('../lib/supabase', () => ({ getSupabase: () => ({ auth, rpc }) }));

import { AuthProvider, useAuth } from './AuthContext';

const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  vi.clearAllMocks();
  auth.getSession.mockResolvedValue({ data: { session: null } });
  auth.signInWithPassword.mockResolvedValue({ data: { user: { email: 'dono@loja.test' } }, error: null });
  auth.signOut.mockResolvedValue({ error: null });
});

describe('AuthContext', () => {
  it('senha errada devolve erro em português', async () => {
    auth.signInWithPassword.mockResolvedValue({ data: { user: null }, error: { message: 'Invalid login credentials' } });
    const { result } = renderHook(() => useAuth(), { wrapper });
    let res: any;
    await act(async () => { res = await result.current.login('dono@loja.test', 'errada'); });
    expect(res).toEqual({ success: false, error: 'E-mail ou senha incorretos.' });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('primeiro acesso pede para cadastrar o aplicativo (QR code)', async () => {
    auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({ data: { currentLevel: 'aal1', nextLevel: 'aal1' } });
    auth.mfa.listFactors.mockResolvedValue({ data: { all: [], totp: [] } });
    auth.mfa.enroll.mockResolvedValue({ data: { id: 'f1', totp: { qr_code: 'data:image/svg+xml;qr', secret: 'ABC' } }, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('dono@loja.test', 'certa'); });
    expect(result.current.mfaStep).toBe('enroll');
    expect(result.current.mfaEnrollment).toEqual({ qrCode: 'data:image/svg+xml;qr', secret: 'ABC' });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('acesso seguinte pede só o código', async () => {
    auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({ data: { currentLevel: 'aal1', nextLevel: 'aal2' } });
    auth.mfa.listFactors.mockResolvedValue({ data: { all: [{ id: 'f1', status: 'verified' }], totp: [{ id: 'f1', status: 'verified' }] } });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('dono@loja.test', 'certa'); });
    expect(result.current.mfaStep).toBe('verify');
    expect(auth.mfa.enroll).not.toHaveBeenCalled();
  });

  it('código certo de um administrador libera o painel', async () => {
    auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({ data: { currentLevel: 'aal1', nextLevel: 'aal2' } });
    auth.mfa.listFactors.mockResolvedValue({ data: { all: [{ id: 'f1', status: 'verified' }], totp: [{ id: 'f1', status: 'verified' }] } });
    auth.mfa.challengeAndVerify.mockResolvedValue({ data: {}, error: null });
    rpc.mockResolvedValue({ data: true, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('dono@loja.test', 'certa'); });
    // depois do código, a sessão passa a ser aal2
    auth.getSession.mockResolvedValue({ data: { session: { user: { email: 'dono@loja.test' } } } });
    auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({ data: { currentLevel: 'aal2', nextLevel: 'aal2' } });
    let res: any;
    await act(async () => { res = await result.current.verifyMfa('123456'); });
    expect(res).toEqual({ success: true });
    expect(auth.mfa.challengeAndVerify).toHaveBeenCalledWith({ factorId: 'f1', code: '123456' });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
  });

  it('conta que não é administradora é desconectada', async () => {
    auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({ data: { currentLevel: 'aal1', nextLevel: 'aal2' } });
    auth.mfa.listFactors.mockResolvedValue({ data: { all: [{ id: 'f1', status: 'verified' }], totp: [{ id: 'f1', status: 'verified' }] } });
    auth.mfa.challengeAndVerify.mockResolvedValue({ data: {}, error: null });
    rpc.mockResolvedValue({ data: false, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('outra@conta.test', 'certa'); });
    auth.getSession.mockResolvedValue({ data: { session: { user: { email: 'outra@conta.test' } } } });
    auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({ data: { currentLevel: 'aal2', nextLevel: 'aal2' } });
    let res: any;
    await act(async () => { res = await result.current.verifyMfa('123456'); });
    expect(res).toEqual({ success: false, error: 'Esta conta não tem acesso ao painel.' });
    expect(auth.signOut).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('código errado mostra erro', async () => {
    auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({ data: { currentLevel: 'aal1', nextLevel: 'aal2' } });
    auth.mfa.listFactors.mockResolvedValue({ data: { all: [{ id: 'f1', status: 'verified' }], totp: [{ id: 'f1', status: 'verified' }] } });
    auth.mfa.challengeAndVerify.mockResolvedValue({ data: null, error: { message: 'Invalid TOTP code entered' } });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('dono@loja.test', 'certa'); });
    let res: any;
    await act(async () => { res = await result.current.verifyMfa('000000'); });
    expect(res).toEqual({ success: false, error: 'Código inválido. Confira o aplicativo e tente de novo.' });
  });
  it('sessão salva com duas etapas (aal2) de um administrador entra direto', async () => {
    auth.getSession.mockResolvedValue({ data: { session: { user: { email: 'dono@loja.test' } } } });
    auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({ data: { currentLevel: 'aal2', nextLevel: 'aal2' } });
    rpc.mockResolvedValue({ data: true, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
  });

  it('sessão salva só com senha (aal1) não entra', async () => {
    auth.getSession.mockResolvedValue({ data: { session: { user: { email: 'dono@loja.test' } } } });
    auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({ data: { currentLevel: 'aal1', nextLevel: 'aal2' } });
    rpc.mockResolvedValue({ data: true, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(auth.mfa.getAuthenticatorAssuranceLevel).toHaveBeenCalled());
    await act(async () => {});
    expect(rpc).not.toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sair desconecta e limpa o estado', async () => {
    auth.getSession.mockResolvedValue({ data: { session: { user: { email: 'dono@loja.test' } } } });
    auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({ data: { currentLevel: 'aal2', nextLevel: 'aal2' } });
    rpc.mockResolvedValue({ data: true, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    await act(async () => { await result.current.logout(); });
    expect(auth.signOut).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.mfaStep).toBe('none');
    expect(result.current.mfaEnrollment).toBeNull();
  });

  it('se o servidor falhar ao sair, limpa a sessão local mesmo assim', async () => {
    auth.signOut
      .mockResolvedValueOnce({ error: { message: 'network error' } })
      .mockResolvedValueOnce({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.logout(); });
    expect(auth.signOut).toHaveBeenNthCalledWith(2, { scope: 'local' });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sair durante o cadastro do aplicativo apaga o QR code e o fator', async () => {
    auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({ data: { currentLevel: 'aal1', nextLevel: 'aal1' } });
    auth.mfa.listFactors.mockResolvedValue({ data: { all: [], totp: [] } });
    auth.mfa.enroll.mockResolvedValue({ data: { id: 'f1', totp: { qr_code: 'qr', secret: 'ABC' } }, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('dono@loja.test', 'certa'); });
    await act(async () => { await result.current.logout(); });
    expect(result.current.mfaEnrollment).toBeNull();
    let res: any;
    await act(async () => { res = await result.current.verifyMfa('123456'); });
    expect(res).toEqual({ success: false, error: 'Faça o login de novo.' });
    expect(auth.mfa.challengeAndVerify).not.toHaveBeenCalled();
  });

  it('erro ao listar os fatores devolve mensagem e não cadastra outro aplicativo', async () => {
    auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({ data: { currentLevel: 'aal1', nextLevel: 'aal2' } });
    auth.mfa.listFactors.mockResolvedValue({ data: null, error: { message: 'timeout' } });
    const { result } = renderHook(() => useAuth(), { wrapper });
    let res: any;
    await act(async () => { res = await result.current.login('dono@loja.test', 'certa'); });
    expect(res).toEqual({ success: false, error: 'Não foi possível verificar sua conta. Tente de novo.' });
    expect(auth.mfa.enroll).not.toHaveBeenCalled();
    expect(auth.mfa.unenroll).not.toHaveBeenCalled();
  });
});
