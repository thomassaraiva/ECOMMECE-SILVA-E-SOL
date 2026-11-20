import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoreStatus } from './StoreStatus';

const base = { isLoading: false, loadError: null, hasProducts: false, whatsappNumber: '5581920019982', onRetry: () => {} };

describe('StoreStatus', () => {
  it('sem produtos mostra "Novidades chegando em breve" e link do WhatsApp', () => {
    render(<StoreStatus {...base} />);
    expect(screen.getByText('Novidades chegando em breve')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', expect.stringContaining('wa.me/5581920019982'));
  });

  it('com erro mostra a mensagem e o botão de tentar de novo', () => {
    const onRetry = vi.fn();
    render(<StoreStatus {...base} loadError="timeout" onRetry={onRetry} />);
    expect(screen.getByText('Não foi possível carregar a loja agora')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('com produtos não mostra nada', () => {
    const { container } = render(<StoreStatus {...base} hasProducts />);
    expect(container).toBeEmptyDOMElement();
  });

  it('carregando mostra aviso acessível', () => {
    render(<StoreStatus {...base} isLoading />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando a loja');
  });
});
