import { describe, it, expect } from 'vitest';
import { formatBRL } from './format';

describe('formatBRL', () => {
  it('formata com vírgula e duas casas', () => {
    expect(formatBRL(129.9)).toBe('R$ 129,90');
  });

  it('formata zero', () => {
    expect(formatBRL(0)).toBe('R$ 0,00');
  });

  it('não põe separador de milhar', () => {
    expect(formatBRL(1234.5)).toBe('R$ 1234,50');
  });
});
