import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';

vi.mock('../../lib/analytics', () => ({ trackContactWhatsApp: vi.fn() }));
let ctx: any;
vi.mock('../../context/StoreContext', () => ({ useStore: () => ctx }));

import { WhatsAppFloat } from './WhatsAppFloat';

const text = () => decodeURIComponent((screen.getByRole('link') as HTMLAnchorElement).href.split('text=')[1]);
const settings = { whatsappNumber: '5581900000000' };

describe('WhatsAppFloat', () => {
  beforeEach(() => cleanup());
  it('na página do produto pergunta sobre a peça', () => {
    ctx = { settings, currentPage: 'product', selectedProduct: { name: 'Sunga Listrada' } };
    render(<WhatsAppFloat />);
    expect(text()).toContain('Tenho uma dúvida sobre a Sunga Listrada');
  });
  it('nas outras páginas mantém o texto geral', () => {
    ctx = { settings, currentPage: 'home', selectedProduct: { name: 'Sunga Listrada' } };
    render(<WhatsAppFloat />);
    expect(text()).toContain('Gostaria de informações sobre os produtos');
  });
});
