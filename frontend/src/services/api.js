import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

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
  const response = await api.get(`/dictionary/search/${encodeURIComponent(word)}`);
  return response.data;
}

/**
 * Get kanji details
 */
export async function getKanjiInfo(kanji) {
  const response = await api.get(`/dictionary/kanji/${encodeURIComponent(kanji)}`);
  return response.data;
}

/**
 * Get example sentences
 */
export async function getExampleSentences(word) {
  const response = await api.get(`/sentences/search/${encodeURIComponent(word)}`);
  return response.data;
}

/**
 * Get kanji stroke data
 */
export async function getKanjiStrokes(kanji) {
  const response = await api.get(`/kanji/strokes/${encodeURIComponent(kanji)}`);
  return response.data;
}

/**
 * Get kanji SVG
 */
export function getKanjiSvgUrl(kanji) {
  return `${API_BASE}/kanji/svg/${encodeURIComponent(kanji)}`;
}

export default api;
