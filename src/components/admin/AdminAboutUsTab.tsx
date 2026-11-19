import React, { useState } from 'react';
import {
  Check,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminAboutUsTab: React.FC = () => {
  const { settings, updateSettings, setCurrentPage } = useStore();

  const [aboutTitle, setAboutTitle] = useState(settings.aboutTitle || 'A Alma Silva e Sol');
  const [aboutText, setAboutText] = useState(settings.aboutText || '');
  const [missionText, setMissionText] = useState(settings.missionText || '');
  const [manifestoText, setManifestoText] = useState(settings.manifestoText || '');
  const [aboutImageUrl, setAboutImageUrl] = useState(
    settings.aboutImageUrl || 
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        aboutTitle: aboutTitle.trim(),
        aboutText: aboutText.trim(),
        missionText: missionText.trim(),
        manifestoText: manifestoText.trim(),
        aboutImageUrl: aboutImageUrl.trim()
      });
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
            Edite a narrativa da Silva e Sol, missão, manifesto e imagem da história que encanta os clientes.
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
          {/* Título Principal */}
          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
              Título Institucional da Página *
            </label>
            <input
              type="text"
              required
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-[#2A8882]"
            />
          </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Missão & Compromisso
              </label>
              <textarea
                rows={3}
                value={missionText}
                onChange={(e) => setMissionText(e.target.value)}
                className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs leading-relaxed focus:outline-none focus:border-[#2A8882]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Manifesto Solar da Marca
              </label>
              <textarea
                rows={3}
                value={manifestoText}
                onChange={(e) => setManifestoText(e.target.value)}
                className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs leading-relaxed focus:outline-none focus:border-[#2A8882]"
              />
            </div>
          </div>

          {/* Imagem de Destaque Institucional */}
          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
              Foto de Destaque da Marca (URL)
            </label>
            <input
              type="url"
              value={aboutImageUrl}
              onChange={(e) => setAboutImageUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
            />

            {aboutImageUrl && (
              <div className="mt-3 relative h-48 sm:h-64 rounded-2xl overflow-hidden border border-stone-800 bg-stone-950">
                <img
                  src={aboutImageUrl}
                  alt="Pré-visualização Institucional"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
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
