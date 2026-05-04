const express = require('express');
const fetch = require('node-fetch');
const { toHiragana, toKatakana } = require('../utils/textProcessor');

const router = express.Router();

const FETCH_HEADERS = {
  'User-Agent': 'NihongoLearn/1.0 (Japanese Learning App)',
  Accept: 'application/json',
};

// Simple in-memory cache for API results
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  // Limit cache size
  if (cache.size > 1000) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * GET /api/dictionary/search/:word
 * Search for a word using Jisho API
 */
router.get('/search/:word', async (req, res) => {
  try {
    const { word } = req.params;
    const cacheKey = `word:${word}`;

    // Check cache
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    let results = [];

    // Try Jisho API
    try {
      const response = await fetch(
        `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`,
        { headers: FETCH_HEADERS, timeout: 8000 }
      );

      if (response.ok) {
        const data = await response.json();
        results = (data.data || []).slice(0, 5).map((entry) => {
          const japanese = entry.japanese || [];
          const senses = entry.senses || [];

          return {
            slug: entry.slug,
            isCommon: entry.is_common || false,
            jlpt: entry.jlpt || [],
            tags: entry.tags || [],
            japanese: japanese.map((j) => {
              const reading = j.reading || '';

              return {
                word: j.word || '',
                reading,
                readingHiragana: toHiragana(reading),
                readingKatakana: toKatakana(reading),
              };
            }),
            senses: senses.map((s) => ({
              englishDefinitions: s.english_definitions || [],
              partsOfSpeech: s.parts_of_speech || [],
              tags: s.tags || [],
              info: s.info || [],
            })),
          };
        });
      } else {
        console.warn(`Jisho API returned ${response.status} for "${word}"`);
      }
    } catch (jishoErr) {
      console.warn('Jisho API request failed:', jishoErr.message);
    }

    // If Jisho failed, try alternative: jisho unofficial or just kanjiapi for the word
    if (results.length === 0) {
      try {
        // Try a simpler search via kanjiapi for individual characters
        const chars = word.split('').filter((c) => {
          const code = c.charCodeAt(0);
          return (code >= 0x4e00 && code <= 0x9faf) || (code >= 0x3400 && code <= 0x4dbf);
        });

        if (chars.length > 0) {
          // Build a basic result from kanji data
          const kanjiResults = [];
          for (const c of chars) {
            try {
              const kanjiResp = await fetch(
                `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(c)}`,
                { headers: FETCH_HEADERS, timeout: 5000 }
              );
              if (kanjiResp.ok) {
                const kd = await kanjiResp.json();
                kanjiResults.push(kd);
              }
            } catch (e) {
              // skip
            }
          }

          if (kanjiResults.length > 0) {
            results = [
              {
                slug: word,
                isCommon: false,
                jlpt: [],
                tags: [],
                japanese: [{ word, reading: '', readingHiragana: '', readingKatakana: '' }],
                senses: [
                  {
                    englishDefinitions: kanjiResults
                      .map((k) => k.meanings?.join(', '))
                      .filter(Boolean),
                    partsOfSpeech: [],
                    tags: ['Từ nghĩa kanji'],
                    info: [],
                  },
                ],
              },
            ];
          }
        }
      } catch (fallbackErr) {
        console.warn('Fallback search failed:', fallbackErr.message);
      }
    }

    const result = { success: true, results };
    if (results.length > 0) {
      setCache(cacheKey, result);
    }

    res.json(result);
  } catch (error) {
    console.error('Dictionary search error:', error);
    res.json({ success: true, results: [] });
  }
});

/**
 * GET /api/dictionary/kanji/:kanji
 * Get kanji details
 */
router.get('/kanji/:kanji', async (req, res) => {
  try {
    const { kanji } = req.params;
    const cacheKey = `kanji:${kanji}`;

    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Use kanjiapi.dev for kanji info (more reliable)
    let kanjiDetail = null;
    try {
      const kanjiApiResponse = await fetch(
        `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`,
        { headers: FETCH_HEADERS, timeout: 8000 }
      );
      if (kanjiApiResponse.ok) {
        kanjiDetail = await kanjiApiResponse.json();
      }
    } catch (e) {
      console.warn('kanjiapi.dev request failed:', e.message);
    }

    // Try Mazii API for Vietnamese meaning & etymology
    let maziiData = null;
    try {
      const response = await fetch('https://mazii.net/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dict: 'javi', type: 'kanji', query: kanji, limit: 1 }),
        timeout: 5000
      });
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          maziiData = data.results[0];
        }
      }
    } catch (e) {
      console.warn('Mazii API failed:', e.message);
    }

    // Try Jisho API for additional word data
    let jishoData = [];
    try {
      const response = await fetch(
        `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(kanji)}`,
        { headers: FETCH_HEADERS, timeout: 8000 }
      );
      if (response.ok) {
        const data = await response.json();
        jishoData = data.data ? data.data.slice(0, 3) : [];
      }
    } catch (e) {
      // Jisho failed, continue with kanjiapi data only
    }

    const result = {
      success: true,
      kanji,
      detail: kanjiDetail || maziiData
        ? {
            character: kanji,
            grade: kanjiDetail ? kanjiDetail.grade : null,
            strokeCount: kanjiDetail ? kanjiDetail.stroke_count : (maziiData ? parseInt(maziiData.stroke_count) : null),
            meanings: kanjiDetail ? kanjiDetail.meanings || [] : [],
            kunReadings: kanjiDetail ? kanjiDetail.kun_readings || [] : (maziiData && maziiData.kun ? maziiData.kun.split(' ') : []),
            onReadings: kanjiDetail ? kanjiDetail.on_readings || [] : (maziiData && maziiData.on ? maziiData.on.split(' ') : []),
            jlpt: kanjiDetail ? kanjiDetail.jlpt : (maziiData && maziiData.level ? parseInt(maziiData.level[0].replace('N', '')) : null),
            vietnameseMean: maziiData ? maziiData.mean : null,
            vietnameseDetail: maziiData ? maziiData.detail : null,
            compDetail: maziiData ? maziiData.compDetail : null,
          }
        : null,
      jishoData,
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Kanji lookup error:', error);
    res.json({ success: true, kanji: req.params.kanji, detail: null, jishoData: [] });
  }
});

module.exports = router;
