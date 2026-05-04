import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { searchWord, getKanjiInfo, getExampleSentences } from '../services/api';
import { getKanaForms } from '../utils/kana';

export default function TextViewer() {
  const { state, dispatch } = useApp();
  const { tokens, selectedTokenIndex, stats, fileName, bookmarks } = state;

  const handleWordClick = useCallback(
    async (token, index) => {
      if (!token.isJapanese) return;

      dispatch({
        type: 'SELECT_WORD',
        payload: { word: token, index },
      });

      // Add to history
      dispatch({
        type: 'ADD_TO_HISTORY',
        payload: {
          surface: token.surface,
          reading: token.reading,
          readingHiragana: token.readingHiragana,
          readingKatakana: token.readingKatakana,
          baseForm: token.baseForm,
        },
      });

      try {
        // Fetch word data
        const wordResult = await searchWord(token.baseForm || token.surface);
        dispatch({ type: 'SET_WORD_DATA', payload: wordResult });

        // Fetch kanji data for each kanji in the word
        if (token.kanjiChars && token.kanjiChars.length > 0) {
          for (const kanji of token.kanjiChars) {
            try {
              const kanjiResult = await getKanjiInfo(kanji);
              dispatch({
                type: 'SET_KANJI_DATA',
                payload: { kanji, data: kanjiResult },
              });
            } catch (e) {
              console.warn(`Không thể tải dữ liệu kanji cho ${kanji}:`, e);
            }
          }
        }

        // Fetch example sentences
        try {
          const sentenceResult = await getExampleSentences(token.baseForm || token.surface);
          dispatch({ type: 'SET_EXAMPLE_SENTENCES', payload: sentenceResult.sentences || [] });
        } catch (e) {
          console.warn('Không thể tải câu ví dụ:', e);
        }
      } catch (err) {
        console.error('Không thể tải dữ liệu từ:', err);
        dispatch({ type: 'SET_WORD_LOADING', payload: false });
      }
    },
    [dispatch]
  );

  const handleClearDocument = () => {
    dispatch({ type: 'CLEAR_DOCUMENT' });
  };

  const isBookmarked = (surface) => bookmarks.some((b) => b.surface === surface);

  // Group tokens by line for display
  const renderTokens = () => {
    const lines = [];
    let currentLine = [];

    tokens.forEach((token, i) => {
      if (token.surface === '\n' || token.surface === '\r\n') {
        lines.push(currentLine);
        currentLine = [];
      } else {
        currentLine.push({ token, index: i });
      }
    });
    if (currentLine.length > 0) lines.push(currentLine);

    return lines.map((line, lineIdx) => (
      <div key={lineIdx} className="min-h-[1.8em] leading-relaxed">
        {line.map(({ token, index }) => {
          const isActive = selectedTokenIndex === index;
          const isWord = token.isJapanese;
          const marked = isBookmarked(token.surface);
          const kanaForms = getKanaForms(token);
          const hasFurigana =
            kanaForms.hiragana &&
            kanaForms.hiragana !== token.surface &&
            (token.hasKanji || token.reading !== token.surface);
          const title = [
            kanaForms.hiragana ? `Hiragana: ${kanaForms.hiragana}` : null,
            kanaForms.katakana ? `Katakana: ${kanaForms.katakana}` : null,
            token.baseForm ? `Dạng gốc: ${token.baseForm}` : null,
          ]
            .filter(Boolean)
            .join('\n');

          if (!isWord) {
            return (
              <span key={index} className="text-gray-500 dark:text-gray-500">
                {token.surface}
              </span>
            );
          }

          return (
            <span
              key={index}
              id={`token-${index}`}
              className={`token-word font-japanese inline-block text-lg ${
                isActive ? 'active' : ''
              } ${marked ? 'bookmarked' : ''}`}
              onClick={() => handleWordClick(token, index)}
              title={title}
            >
              {hasFurigana ? (
                <ruby>
                  {token.surface}
                  <rt>{kanaForms.hiragana}</rt>
                </ruby>
              ) : (
                token.surface
              )}
            </span>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-nihon-border bg-gray-50/50 dark:bg-nihon-dark/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
            📄 {fileName || 'Tài liệu'}
          </span>
          {stats && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-nihon-card rounded-md">
                {stats.totalTokens} đơn vị
              </span>
              <span className="px-2 py-0.5 bg-sakura-50 dark:bg-sakura-900/20 text-sakura-600 dark:text-sakura-400 rounded-md">
                {stats.kanjiTokens} từ có kanji
              </span>
            </div>
          )}
        </div>
        <button
          id="clear-doc-btn"
          onClick={handleClearDocument}
          className="btn-ghost text-xs text-gray-400 hover:text-red-500"
        >
          ✕ Đóng
        </button>
      </div>

      {/* Text Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-1">
          {renderTokens()}
        </div>
      </div>
    </div>
  );
}
