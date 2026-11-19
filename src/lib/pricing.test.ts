import { describe, it, expect } from 'vitest';
import { effectivePrice } from './pricing';

describe('effectivePrice', () => {
  it('usa o preço promocional quando é menor que o normal', () => {
    expect(effectivePrice({ price: 129.9, promotionalPrice: 99.9 })).toBe(99.9);
  });

  it('usa o preço normal sem promoção', () => {
    expect(effectivePrice({ price: 129.9 })).toBe(129.9);
    expect(effectivePrice({ price: 129.9, promotionalPrice: null })).toBe(129.9);
  });

  it('ignora promoção zerada, negativa ou inválida', () => {
    expect(effectivePrice({ price: 129.9, promotionalPrice: 0 })).toBe(129.9);
    expect(effectivePrice({ price: 129.9, promotionalPrice: -10 })).toBe(129.9);
    expect(effectivePrice({ price: 129.9, promotionalPrice: NaN })).toBe(129.9);
  });

  it('ignora promoção igual ou maior que o preço normal', () => {
    expect(effectivePrice({ price: 129.9, promotionalPrice: 129.9 })).toBe(129.9);
    expect(effectivePrice({ price: 129.9, promotionalPrice: 150 })).toBe(129.9);
  });
});
