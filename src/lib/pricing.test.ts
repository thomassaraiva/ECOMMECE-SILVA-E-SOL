import { describe, it, expect } from 'vitest';
import { effectivePrice, parsePercent, promoFromPercent, percentFromPromo } from './pricing';

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

describe('desconto em %', () => {
  it('calcula o preço promocional arredondando ao centavo', () => {
    expect(promoFromPercent(129.9, 20)).toBe(103.92);
    expect(promoFromPercent(10, 33.3)).toBe(6.67);
  });
  it('calcula o % a partir do promocional, com 1 casa', () => {
    expect(percentFromPromo(129.9, 99.9)).toBe(23.1);
  });
  it('percentFromPromo devolve null para promoção inválida', () => {
    expect(percentFromPromo(100, 100)).toBeNull();
    expect(percentFromPromo(100, 0)).toBeNull();
    expect(percentFromPromo(0, 10)).toBeNull();
  });
  it('parsePercent aceita vírgula ou ponto, até 1 casa, entre 0 e 100 exclusivos', () => {
    expect(parsePercent('12,5')).toBe(12.5);
    expect(parsePercent('12.5')).toBe(12.5);
    expect(parsePercent(' 20 ')).toBe(20);
    expect(parsePercent('99.9')).toBe(99.9);
  });
  it.each(['0', '100', '-5', 'abc', '', '12.55', '1e1'])('parsePercent recusa "%s"', (t) => {
    expect(parsePercent(t)).toBeNull();
  });
});
