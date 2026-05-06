import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://nihongo-learn.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Cache map for API requests
const cache = new Map();

/**
 * Helper to fetch with caching
 */
async function fetchWithCache(key, url) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const response = await api.get(url);
  cache.set(key, response.data);
  return response.data;
}

/**
 * Upload a file for processing
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Submit text directly for processing
 */
export async function submitText(text) {
  const response = await api.post('/upload/text', { text });
  return response.data;
}

/**
 * Search word definition from Jisho
 */
export async function searchWord(word) {
  return fetchWithCache(`word:${word}`, `/dictionary/search/${encodeURIComponent(word)}`);
}

/**
 * Get Vietnamese word meaning from Mazii
 */
export async function searchMaziiWord(word) {
  return fetchWithCache(`mazii:${word}`, `/dictionary/mazii/${encodeURIComponent(word)}`);
}

/**
 * Get kanji details
 */
export async function getKanjiInfo(kanji) {
  return fetchWithCache(`kanjiInfo:${kanji}`, `/dictionary/kanji/${encodeURIComponent(kanji)}`);
}

/**
 * Get example sentences
 */
export async function getExampleSentences(word) {
  return fetchWithCache(`sentences:${word}`, `/sentences/search/${encodeURIComponent(word)}`);
}

/**
 * Get kanji stroke data
 */
export async function getKanjiStrokes(kanji) {
  return fetchWithCache(`strokes:${kanji}`, `/kanji/strokes/${encodeURIComponent(kanji)}`);
}

/**
 * Get kanji SVG
 */
export function getKanjiSvgUrl(kanji) {
  return `${API_BASE}/kanji/svg/${encodeURIComponent(kanji)}`;
}

export default api;
