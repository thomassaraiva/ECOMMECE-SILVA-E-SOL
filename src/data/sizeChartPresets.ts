import { SizeChart } from '../types/ecommerce';

export interface SizeChartPreset {
  id: string;
  name: string;
  categoryMatch: string[];
  chart: SizeChart;
}

export const SIZE_CHART_PRESETS: SizeChartPreset[] = [
  {
    id: 'sungas',
    name: 'Sungas (Slim Lateral 9cm, Boxer e Tradicional)',
    categoryMatch: ['cat-sungas', 'sungas'],
    chart: {
      title: 'Tabela de Medidas Oficial - Sungas (Slim 9cm)',
      columns: ['Tamanho', 'Cintura (cm)', 'Quadril (cm)', 'Lateral Slim (cm)'],
      rows: [
        { size: 'P (38)', values: ['76 - 80 cm', '90 - 94 cm', '9 cm'] },
        { size: 'M (40)', values: ['82 - 86 cm', '96 - 100 cm', '9,5 cm'] },
        { size: 'G (42)', values: ['88 - 92 cm', '102 - 106 cm', '10 cm'] },
        { size: 'GG (44-46)', values: ['94 - 98 cm', '108 - 114 cm', '10,5 cm'] },
      ],
      instructions: 'Passe a fita métrica em torno da cintura na altura habitual da sunga e no ponto mais largo do quadril. Nossa modelagem Slim possui lateral de 9cm para excelente caimento solar, liberdade de movimento e forro duplo com cordão interno ajustável.'
    }
  },
  {
    id: 'camisetas',
    name: 'Camisetas Masculinas (Regular e Confort)',
    categoryMatch: ['cat-camisetas', 'camisetas'],
    chart: {
      title: 'Tabela de Medidas Oficial - Camisetas',
      columns: ['Tamanho', 'Tórax (cm)', 'Comprimento (cm)', 'Manga (cm)'],
      rows: [
        { size: 'P', values: ['96 - 100 cm', '70 cm', '21 cm'] },
        { size: 'M', values: ['102 - 106 cm', '72 cm', '22 cm'] },
        { size: 'G', values: ['108 - 112 cm', '74 cm', '23 cm'] },
        { size: 'GG', values: ['114 - 118 cm', '76 cm', '24 cm'] },
      ],
      instructions: 'Meça a circunferência do tórax na linha dos mamilos com os braços relaxados ao lado do corpo. O comprimento é medido do ponto mais alto do ombro até a barra.'
    }
  },
  {
    id: 'regatas',
    name: 'Regatas Caneladas e Praia',
    categoryMatch: ['cat-regatas', 'regatas'],
    chart: {
      title: 'Tabela de Medidas Oficial - Regatas',
      columns: ['Tamanho', 'Tórax (cm)', 'Comprimento (cm)', 'Cava (cm)'],
      rows: [
        { size: 'P', values: ['92 - 96 cm', '68 cm', '26 cm'] },
        { size: 'M', values: ['98 - 102 cm', '70 cm', '27 cm'] },
        { size: 'G', values: ['104 - 108 cm', '72 cm', '28 cm'] },
        { size: 'GG', values: ['110 - 114 cm', '74 cm', '29 cm'] },
      ],
      instructions: 'Regatas com corte ergonômico que valorizam os ombros e o peito sem apertar. Tecido fresco e respirável.'
    }
  },
  {
    id: 'shorts',
    name: 'Shorts de Praia e Bermudas',
    categoryMatch: ['cat-shorts', 'shorts'],
    chart: {
      title: 'Tabela de Medidas Oficial - Shorts & Bermudas',
      columns: ['Tamanho', 'Cintura (cm)', 'Quadril (cm)', 'Comprimento (cm)'],
      rows: [
        { size: 'P (38)', values: ['76 - 82 cm', '98 - 102 cm', '40 cm'] },
        { size: 'M (40)', values: ['84 - 88 cm', '104 - 108 cm', '42 cm'] },
        { size: 'G (42)', values: ['90 - 96 cm', '110 - 114 cm', '44 cm'] },
        { size: 'GG (44-46)', values: ['98 - 104 cm', '116 - 120 cm', '46 cm'] },
      ],
      instructions: 'Cós flexível com elástico reforçado e cordão interno. O comprimento fica ligeiramente acima do joelho para conforto ao sentar e caminhar.'
    }
  },
  {
    id: 'bolsas',
    name: 'Bolsas & Mochilas de Lona',
    categoryMatch: ['cat-bolsas', 'bolsas'],
    chart: {
      title: 'Dimensões e Capacidade',
      columns: ['Item', 'Dimensão', 'Material'],
      rows: [
        { size: 'Corpo da Bolsa', values: ['42cm (largura) x 38cm (altura) x 12cm (fundo)', 'Lona de Algodão Encerada 100%'] },
        { size: 'Alça de Ombro', values: ['60cm de extensão reforçada', 'Fita de Algodão Cru 40mm'] },
        { size: 'Bolso Interno', values: ['20cm x 16cm com zíper anti-areia', 'Forro Hidrorrepelente'] }
      ],
      instructions: 'Tamanho ideal para toalha de praia, protetor solar, sunga extra e garrafa d\'água.'
    }
  },
  {
    id: 'acessorios',
    name: 'Bonés e Chapéus',
    categoryMatch: ['cat-acessorios', 'acessorios'],
    chart: {
      title: 'Guia de Ajuste e Circunferência',
      columns: ['Tamanho', 'Circunferência Cabeça', 'Aba', 'Regulagem'],
      rows: [
        { size: 'Único Adulto', values: ['55 a 61 cm', '7 cm curvada', 'Fivela de latão traseira ajustável'] }
      ],
      instructions: 'Passar a fita métrica 1 dedo acima das orelhas e no meio da testa para conferir a circunferência da cabeça.'
    }
  }
];

export function getDefaultSizeChartForCategory(categoryId: string): SizeChart {
  const found = SIZE_CHART_PRESETS.find(p => p.categoryMatch.includes(categoryId));
  if (found) {
    return JSON.parse(JSON.stringify(found.chart));
  }
  // Fallback padrão
  return JSON.parse(JSON.stringify(SIZE_CHART_PRESETS[0].chart));
}
