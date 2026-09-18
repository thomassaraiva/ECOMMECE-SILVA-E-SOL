import React from 'react';
import { X, Ruler, HelpCircle, MessageCircle, CheckCircle2 } from 'lucide-react';
import { SizeChart } from '../../types/ecommerce';
import { useStore } from '../../context/StoreContext';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeChart?: SizeChart;
  productName: string;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({
  isOpen,
  onClose,
  sizeChart,
  productName
}) => {
  const { settings } = useStore();

  if (!isOpen) return null;

  const phone = settings.whatsappNumber.replace(/\D/g, '') || '5581920019982';
  const whatsappHelpUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    `Olá! Tenho uma dúvida sobre a tabela de medidas da peça "${productName}". Vocês podem me ajudar a escolher o tamanho perfeito?`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative bg-[#FAF7F2] border border-[#E6DDD0] rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden z-10 text-[#2D2823] animate-in zoom-in-95 duration-200">
        
        {/* Cabeçalho do Modal */}
        <div className="p-4 sm:p-5 border-b border-[#E6DDD0] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8F4F3] border border-[#2A8882]/20 flex items-center justify-center text-[#2A8882]">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#2D2823] leading-tight">
                {sizeChart?.title || 'Tabela de Medidas'}
              </h3>
              <p className="text-xs text-[#736A5E] line-clamp-1">
                {productName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#736A5E] hover:text-[#2D2823] rounded-lg hover:bg-[#F5EFE6] transition-colors"
            aria-label="Fechar tabela de medidas"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo da Tabela */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-5">
          
          {sizeChart && sizeChart.columns && sizeChart.rows ? (
            <div className="overflow-x-auto rounded-xl border border-[#E6DDD0] bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F5EFE6] text-[#2D2823] border-b border-[#E6DDD0] font-heading font-bold">
                    {sizeChart.columns.map((col, idx) => (
                      <th 
                        key={idx} 
                        className={`py-3 px-3.5 sm:px-4 ${idx === 0 ? 'text-left font-bold text-[#2A8882]' : 'text-center'}`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DDD0]/70 text-[#524B42]">
                  {sizeChart.rows.map((row, rIdx) => (
                    <tr 
                      key={rIdx} 
                      className={`hover:bg-[#FAF7F2] transition-colors ${rIdx % 2 === 1 ? 'bg-[#FCFAF7]' : 'bg-white'}`}
                    >
                      <td className="py-2.5 px-3.5 sm:px-4 font-bold text-[#2D2823] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F4803E]" />
                          {row.size}
                        </span>
                      </td>
                      {row.values.map((val, vIdx) => (
                        <td key={vIdx} className="py-2.5 px-3.5 sm:px-4 text-center font-mono text-xs whitespace-nowrap">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-[#736A5E] bg-white rounded-xl border border-[#E6DDD0]">
              <p className="text-sm">Tabela de medidas sob consulta.</p>
              <p className="text-xs text-[#8A8072] mt-1">Fale conosco pelo WhatsApp para obter as dimensões exatas desta peça.</p>
            </div>
          )}

          {/* Instruções de Medição */}
          {sizeChart?.instructions && (
            <div className="bg-[#E8F4F3]/60 border border-[#2A8882]/20 rounded-xl p-3.5 sm:p-4 text-xs text-[#2D2823] flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#2A8882] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-[#2A8882] block">Como Medir seu Corpo:</span>
                <p className="text-[#524B42] leading-relaxed">
                  {sizeChart.instructions}
                </p>
              </div>
            </div>
          )}

          {/* Dicas de Caimento da Marca */}
          <div className="bg-white border border-[#E6DDD0] rounded-xl p-3.5 sm:p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-[#2D2823]">
              <HelpCircle className="w-4 h-4 text-[#F4803E]" />
              <span>Dúvida entre dois tamanhos?</span>
            </div>
            <p className="text-[#736A5E] leading-relaxed">
              Nossas peças masculinas foram desenhadas com modelagem anatômica para valorizar o corpo sem apertar.
              Se você prefere um caimento mais justo e firme (ótimo para esportes aquáticos), escolha o tamanho menor. Se prefere maior liberdade e cobertura, opte pelo tamanho maior.
            </p>
          </div>

          {/* Dúvida Direta pelo WhatsApp */}
          <div className="pt-1">
            <a
              href={whatsappHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white text-white" />
              <span>Dúvida no Tamanho? Falar com Especialista no WhatsApp</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
