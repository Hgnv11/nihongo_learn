const express = require('express');
const fetch = require('node-fetch');
const { tokenizeText } = require('../utils/textProcessor');

const router = express.Router();

const FETCH_HEADERS = {
  'User-Agent': 'NihongoLearn/1.0 (Japanese Learning App)',
  Accept: 'application/json',
};

// Cache
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  if (cache.size > 500) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Helper: fetch Tatoeba sentences with proper AbortController timeout
 */
async function fetchTatoeba(word, targetLang, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(
      `https://tatoeba.org/en/api_v0/search?from=jpn&to=${targetLang}&query=${encodeURIComponent(word)}&limit=5`,
      { headers: FETCH_HEADERS, signal: controller.signal }
    );
    clearTimeout(timer);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      console.warn(`Tatoeba timeout (${targetLang}) for "${word}"`);
    } else {
      console.warn(`Tatoeba error (${targetLang}) for "${word}":`, err.message);
    }
    return [];
  }
}

/**
 * GET /api/sentences/search/:word
 * Search for example sentences using Tatoeba API
 */
router.get('/search/:word', async (req, res) => {
  try {
    const { word } = req.params;
    const cacheKey = `sentences:${word}`;

    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    let sentences = [];
    let usedLang = null;

    // 1. Try Vietnamese first (short timeout)
    const vieResults = await fetchTatoeba(word, 'vie', 5000);
    if (vieResults.length > 0) {
      usedLang = 'vie';
      sentences = vieResults.slice(0, 3).map((result) => {
        const translation = result.translations
          ? result.translations.flat().find((t) => t && t.lang === 'vie')
          : null;
        let tokens = null;
        try { if (result.text) tokens = tokenizeText(result.text); } catch (e) {}
        return {
          id: result.id,
          text: result.text,
          lang: result.lang,
          tokens,
          translation: translation ? translation.text : null,
          translationLang: 'vie',
        };
      });
    }

    // 2. Fallback to English if no Vietnamese results
    if (sentences.length === 0) {
      const engResults = await fetchTatoeba(word, 'eng', 5000);
      if (engResults.length > 0) {
        usedLang = 'eng';
        sentences = engResults.slice(0, 3).map((result) => {
          const translation = result.translations
            ? result.translations.flat().find((t) => t && t.lang === 'eng')
            : null;
          let tokens = null;
          try { if (result.text) tokens = tokenizeText(result.text); } catch (e) {}
          return {
            id: result.id,
            text: result.text,
            lang: result.lang,
            tokens,
            translation: translation ? translation.text : null,
            translationLang: 'eng',
          };
        });
      }
    }

    // 3. Final fallback: generated sentences
    if (sentences.length === 0) {
      sentences = generateFallbackSentences(word);
    }

    const result = { success: true, word, sentences, usedLang };
    setCache(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Sentence search error:', error);
    const sentences = generateFallbackSentences(req.params.word);
    res.json({ success: true, word: req.params.word, sentences, fallback: true });
  }
});

/**
 * Generate fallback example sentences when API is unavailable
 */
function generateFallbackSentences(word) {
  const sentences = [
    {
      id: 'fallback-1',
      text: `「${word}」はよく使われる言葉です。`,
      lang: 'jpn',
      translation: `"${word}" là một từ thường được sử dụng.`,
      translationLang: 'vie',
      isFallback: true,
    },
    {
      id: 'fallback-2',
      text: `この文で「${word}」を使います。`,
      lang: 'jpn',
      translation: `Tôi dùng "${word}" trong câu này.`,
      translationLang: 'vie',
      isFallback: true,
    },
    {
      id: 'fallback-3',
      text: `${word}の意味を調べましょう。`,
      lang: 'jpn',
      translation: `Hãy tra nghĩa của "${word}".`,
      translationLang: 'vie',
      isFallback: true,
    },
  ];

  return sentences.map(s => {
    try {
      s.tokens = tokenizeText(s.text);
    } catch (e) {}
    return s;
  });
}

module.exports = router;
