import { countLabelCharacters, limitLabel } from '../../src/domain/label';
import { rules } from '../../config/rules';

const maximum = rules.alarms.maximumLabelCharacters;

describe('alarm label character counting', () => {
  it('uses the configured 30-character limit', () => {
    expect(maximum).toBe(30);
  });

  it('counts and truncates plain ASCII characters', () => {
    expect(countLabelCharacters('abcdefghij')).toBe(10);
    expect(limitLabel('a'.repeat(35))).toBe('a'.repeat(maximum));
    expect(countLabelCharacters(limitLabel('a'.repeat(35)))).toBe(maximum);
  });

  it('counts each emoji as one character, not two UTF-16 units', () => {
    expect('😀'.length).toBe(2);
    expect(countLabelCharacters('😀')).toBe(1);
    expect(countLabelCharacters('😀'.repeat(30))).toBe(30);
    expect(limitLabel('😀'.repeat(35))).toBe('😀'.repeat(maximum));
    expect(countLabelCharacters(limitLabel('😀'.repeat(35)))).toBe(maximum);
  });

  it('counts combined ZWJ families as one character', () => {
    const family = '👨‍👩‍👧‍👦';
    expect(countLabelCharacters(family)).toBe(1);
    expect(limitLabel(family.repeat(31))).toBe(family.repeat(maximum));
    expect(countLabelCharacters(limitLabel(family.repeat(31)))).toBe(maximum);
  });

  it('counts skin-tone modifiers and variation selectors as part of one character', () => {
    expect(countLabelCharacters('👍🏽')).toBe(1);
    expect(countLabelCharacters('❤️')).toBe(1);
    expect(limitLabel('👍🏽'.repeat(35))).toBe('👍🏽'.repeat(maximum));
  });

  it('counts accents built from combining marks as one character', () => {
    expect(countLabelCharacters('e\u0301')).toBe(1);
    expect(limitLabel('e\u0301'.repeat(35))).toBe('e\u0301'.repeat(maximum));
  });

  it('counts regional-indicator flags as one grapheme where Segmenter exists', () => {
    if (typeof (Intl as unknown as { Segmenter?: unknown }).Segmenter === 'function') {
      expect(countLabelCharacters('🇺🇸')).toBe(1);
    }
  });

  it('uses a grapheme-aware fallback when Intl.Segmenter is unavailable', () => {
    const intlWithSegmenter = Intl as unknown as { Segmenter?: unknown };
    const original = intlWithSegmenter.Segmenter;

    try {
      intlWithSegmenter.Segmenter = undefined;

      expect(countLabelCharacters('😀'.repeat(30))).toBe(30);
      expect(countLabelCharacters('e\u0301')).toBe(1);
      expect(countLabelCharacters('👍🏽')).toBe(1);
      expect(limitLabel('😀'.repeat(35))).toBe('😀'.repeat(maximum));
    } finally {
      intlWithSegmenter.Segmenter = original;
    }
  });
});
