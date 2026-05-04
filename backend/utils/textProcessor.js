const kuromoji = require('kuromoji');
const path = require('path');

let tokenizer = null;

/**
 * Initialize the kuromoji tokenizer with dictionary
 */
function initTokenizer() {
  return new Promise((resolve, reject) => {
    const dicPath = path.join(__dirname, '..', 'node_modules', 'kuromoji', 'dict');
    kuromoji.builder({ dicPath }).build((err, _tokenizer) => {
      if (err) {
        reject(err);
        return;
      }
      tokenizer = _tokenizer;
      resolve();
    });
  });
}

/**
 * Check if text contains Japanese characters
 */
function containsJapanese(text) {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/.test(text);
}

/**
 * Convert full-width Katakana to Hiragana.
 */
function toHiragana(text = '') {
  return text.replace(/[\u30A1-\u30F6]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60)
  );
}

/**
 * Convert Hiragana to full-width Katakana.
 */
function toKatakana(text = '') {
  return text.replace(/[\u3041-\u3096]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) + 0x60)
  );
}

/**
 * Check if a character is Kanji
 */
function isKanji(char) {
  const code = char.charCodeAt(0);
  return (code >= 0x4E00 && code <= 0x9FAF) || (code >= 0x3400 && code <= 0x4DBF);
}

/**
 * Tokenize Japanese text into words with detailed information
 */
function tokenizeText(text) {
  if (!tokenizer) {
    throw new Error('Tokenizer not initialized');
  }

  const tokens = tokenizer.tokenize(text);

  return tokens.map((token) => {
    const kanjiChars = token.surface_form.split('').filter(isKanji);
    const reading = token.reading && token.reading !== '*'
      ? token.reading
      : token.pronunciation && token.pronunciation !== '*'
        ? token.pronunciation
        : token.surface_form;

    return {
      surface: token.surface_form,
      reading,
      readingHiragana: toHiragana(reading),
      readingKatakana: toKatakana(reading),
      pronunciation: token.pronunciation || '',
      baseForm: token.basic_form || token.surface_form,
      pos: token.pos || '',
      posDetail1: token.pos_detail_1 || '',
      posDetail2: token.pos_detail_2 || '',
      posDetail3: token.pos_detail_3 || '',
      conjugatedType: token.conjugated_type || '',
      conjugatedForm: token.conjugated_form || '',
      isJapanese: containsJapanese(token.surface_form),
      hasKanji: kanjiChars.length > 0,
      kanjiChars,
      wordId: token.word_id,
    };
  });
}

/**
 * Extract sentences from text
 */
function extractSentences(text) {
  // Split by Japanese sentence-ending punctuation and newlines
  const sentences = text
    .split(/(?<=[。！？\n])/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && containsJapanese(s));

  return sentences;
}

module.exports = {
  initTokenizer,
  tokenizeText,
  containsJapanese,
  toHiragana,
  toKatakana,
  isKanji,
  extractSentences,
};
