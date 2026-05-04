const KATAKANA_RANGE = /[\u30A1-\u30F6]/g;
const HIRAGANA_RANGE = /[\u3041-\u3096]/g;
const KANJI_RANGE = /[\u3400-\u4DBF\u4E00-\u9FAF]/;
const KANA_RANGE = /[\u3040-\u309F\u30A0-\u30FF]/;

export function toHiragana(text = '') {
  return text.replace(KATAKANA_RANGE, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60)
  );
}

export function toKatakana(text = '') {
  return text.replace(HIRAGANA_RANGE, (char) =>
    String.fromCharCode(char.charCodeAt(0) + 0x60)
  );
}

export function getKanaForms(source = {}) {
  const surfaceFallback =
    source.surface && KANA_RANGE.test(source.surface) && !KANJI_RANGE.test(source.surface)
      ? source.surface
      : '';
  const reading =
    source.reading ||
    source.readingHiragana ||
    source.readingKatakana ||
    surfaceFallback ||
    '';

  return {
    hiragana: source.readingHiragana || toHiragana(reading),
    katakana: source.readingKatakana || toKatakana(reading),
  };
}
