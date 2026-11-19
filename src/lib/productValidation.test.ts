import { describe, it, expect } from 'vitest';
import { validatePromotion } from './productValidation';

describe('validatePromotion', () => {
  it('aceita sem promoção', () => expect(validatePromotion(100, undefined)).toBeNull());
  it('aceita promoção menor', () => expect(validatePromotion(100, 79.9)).toBeNull());
  it('recusa promoção igual', () => expect(validatePromotion(100, 100)).toMatch(/menor que o preço normal/));
  it('recusa promoção maior', () => expect(validatePromotion(189.9, 219.9)).toMatch(/menor que o preço normal/));
  it('recusa promoção negativa', () => expect(validatePromotion(100, -1)).toMatch(/não pode ser negativo/));
});

describe('validatePromotion com promoção ativa (required)', () => {
  const req = { required: true };
  it('recusa preço normal vazio ou NaN', () => {
    expect(validatePromotion(NaN, 50, req)).toBe('Informe um preço válido.');
    expect(validatePromotion(0, 50, req)).toBe('Informe um preço válido.');
  });
  it('recusa promoção vazia, zero ou NaN', () => {
    expect(validatePromotion(100, undefined, req)).toBe('Informe um preço promocional válido.');
    expect(validatePromotion(100, 0, req)).toBe('Informe um preço promocional válido.');
    expect(validatePromotion(100, NaN, req)).toBe('Informe um preço promocional válido.');
  });
  it('aceita promoção válida', () => expect(validatePromotion(100, 80, req)).toBeNull());
  it('ainda recusa promoção maior ou igual', () => expect(validatePromotion(100, 100, req)).toMatch(/menor que o preço normal/));
});
