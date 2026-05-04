const express = require('express');
const fetch = require('node-fetch');

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

    // Try Tatoeba API
    try {
      const response = await fetch(
        `https://tatoeba.org/en/api_v0/search?from=jpn&to=vie&query=${encodeURIComponent(
          word
        )}&limit=5`,
        { headers: FETCH_HEADERS, timeout: 10000 }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          sentences = data.results.slice(0, 3).map((result) => {
            const translation = result.translations
              ? result.translations.flat().find((t) => t && t.lang === 'vie')
              : null;

            return {
              id: result.id,
              text: result.text,
              lang: result.lang,
              translation: translation ? translation.text : null,
              translationLang: translation ? translation.lang : null,
            };
          });
        }
      } else {
        console.warn(`Tatoeba API returned ${response.status}`);
      }
    } catch (tatoErr) {
      console.warn('Tatoeba API request failed:', tatoErr.message);
    }

    // Fallback examples if no Tatoeba results
    if (sentences.length === 0) {
      sentences = generateFallbackSentences(word);
    }

    const result = { success: true, word, sentences };
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
  return [
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
}

module.exports = router;
