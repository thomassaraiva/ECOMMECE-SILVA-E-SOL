import { describe, it, expect } from 'vitest';
import { validatePromotion } from './productValidation';

describe('validatePromotion', () => {
  it('aceita sem promoção', () => expect(validatePromotion(100, undefined)).toBeNull());
  it('aceita promoção menor', () => expect(validatePromotion(100, 79.9)).toBeNull());
  it('recusa promoção igual', () => expect(validatePromotion(100, 100)).toMatch(/menor que o preço normal/));
  it('recusa promoção maior', () => expect(validatePromotion(189.9, 219.9)).toMatch(/menor que o preço normal/));
  it('recusa promoção negativa', () => expect(validatePromotion(100, -1)).toMatch(/não pode ser negativo/));
});
