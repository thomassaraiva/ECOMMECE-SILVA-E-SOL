import React, { useState } from 'react';
import {
  Check,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { aboutFormToPayload } from '../../lib/adminForms';

export const AdminAboutUsTab: React.FC = () => {
  const { settings, updateSettings, setCurrentPage } = useStore();

  const [aboutText, setAboutText] = useState(settings.aboutText || '');
  const [aboutMission, setAboutMission] = useState(settings.aboutMission || '');

  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(aboutFormToPayload({ aboutText, aboutMission }));
      setActionSuccess('Conteúdo institucional atualizado com sucesso!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch {
      // Só evita a rejeição não tratada: a mensagem já aparece na faixa de erro do painel (runAdmin).
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 border border-emerald-700 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
            Página Institucional &bull; Sobre a Marca
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Edite a história da Silva e Sol e a missão da marca.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage('about')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs sm:text-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <ExternalLink className="w-4 h-4 text-amber-400" />
          <span>Visualizar Página Sobre Nós</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl">
          {/* História e Narrativa */}
          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
              História da Marca (Narrativa Principal) *
            </label>
            <textarea
              rows={4}
              required
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              className="w-full p-4 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-[#2A8882]"
            />
          </div>

          {/* Missão e Propósito */}
          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
              Missão & Compromisso
            </label>
            <textarea
              rows={3}
              value={aboutMission}
              onChange={(e) => setAboutMission(e.target.value)}
              className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs leading-relaxed focus:outline-none focus:border-[#2A8882]"
            />
          </div>

          <p className="text-xs text-stone-500">
            Título, manifesto e foto de destaque: disponível em breve.
          </p>
        </div>

        {/* Botão de Salvar */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white font-bold text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Salvando Alterações...' : 'Salvar Conteúdo Institucional'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
