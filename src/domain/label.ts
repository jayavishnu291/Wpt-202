/**
 * src/domain/label.ts
 *
 * Shared alarm-label character counting (G6 label limit).
 *
 * "30 characters" means 30 user-perceived characters, not 30 UTF-16 code
 * units. Emojis must count as one character, and combined sequences
 * (ZWJ families, skin-tone modifiers, variation selectors and accents) must
 * also count as one. Intl.Segmenter with `granularity: 'grapheme'` is the
 * correct implementation. The fallback keeps surrogate pairs together and
 * attaches combining marks / ZWJ sequences / modifiers to the preceding
 * base character for runtimes that do not ship Intl.Segmenter (for example
 * older Hermes builds).
 */
import { rules } from '../../config/rules';

type Segment = { segment: string };
type SegmenterConstructor = new (
  locales?: string | string[],
  options?: { granularity?: 'grapheme' | 'word' | 'sentence' },
) => { segment(input: string): Iterable<Segment> };

const IntlWithSegmenter = Intl as typeof Intl & {
  Segmenter?: SegmenterConstructor;
};

// One base code point plus any marks, variation selectors, ZWJ sequences or
// emoji skin-tone modifiers that belong to it.
const FALLBACK_GRAPHEME =
  /\P{M}(?:\p{M}|\uFE0F|\u200D\P{M}|[\u{1F3FB}-\u{1F3FF}])*/gu;

function splitGraphemes(value: string): string[] {
  const Segmenter = IntlWithSegmenter.Segmenter;

  if (Segmenter) {
    const segmenter = new Segmenter(undefined, {
      granularity: 'grapheme',
    });

    return Array.from(segmenter.segment(value), ({ segment }) => segment);
  }

  return value.match(FALLBACK_GRAPHEME) ?? [];
}

export function countLabelCharacters(value: string): number {
  return splitGraphemes(value).length;
}

export function limitLabel(
  value: string,
  maximum: number = rules.alarms.maximumLabelCharacters,
): string {
  return splitGraphemes(value).slice(0, maximum).join('');
}
