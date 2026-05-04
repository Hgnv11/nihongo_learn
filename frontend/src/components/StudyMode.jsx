import { useState } from 'react';
import { toHiragana } from 'wanakana';
import { submitText, searchWord } from '../services/api';

export default function StudyMode({ onClose }) {
  const [inputText, setInputText] = useState('');
  const [studyList, setStudyList] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({}); // word -> 'correct' | 'incorrect' | 'revealed'
  const [inputs, setInputs] = useState({}); // word -> string
  const [meanings, setMeanings] = useState({}); // word -> string

  const handleStart = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const data = await submitText(inputText);
      
      // Filter words containing Kanji
      const kanjiWords = data.tokens.filter(t => t.hasKanji);
      
      // Remove duplicates
      const uniqueWords = [];
      const seen = new Set();
      for (const w of kanjiWords) {
        if (!seen.has(w.surface)) {
          seen.add(w.surface);
          uniqueWords.push(w);
        }
      }
      
      setStudyList(uniqueWords);
      setIsStarted(true);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi phân tích từ vựng.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (word, value) => {
    setInputs(prev => ({
      ...prev,
      [word]: toHiragana(value, { IMEMode: true })
    }));
    // Clear error status if typing again
    if (results[word] === 'incorrect') {
      setResults(prev => {
        const next = { ...prev };
        delete next[word];
        return next;
      });
    }
  };

  const loadMeaning = async (wordSurface) => {
    if (meanings[wordSurface]) return;
    try {
      const data = await searchWord(wordSurface);
      if (data.results && data.results.length > 0) {
        const senses = data.results[0].senses;
        // Collect first few english meanings
        const primaryMeaning = senses[0].englishDefinitions.slice(0, 3).join(', ');
        setMeanings(prev => ({ ...prev, [wordSurface]: primaryMeaning }));
      } else {
        setMeanings(prev => ({ ...prev, [wordSurface]: 'Không tìm thấy nghĩa' }));
      }
    } catch (err) {
      setMeanings(prev => ({ ...prev, [wordSurface]: 'Lỗi tải nghĩa' }));
    }
  };

  const checkAnswer = (wordSurface, correctReading) => {
    const userAnswer = (inputs[wordSurface] || '').trim();
    if (!userAnswer) return;

    const isCorrect = userAnswer === correctReading;
    setResults(prev => ({
      ...prev,
      [wordSurface]: isCorrect ? 'correct' : 'incorrect'
    }));

    if (isCorrect) {
      loadMeaning(wordSurface);
    }
  };

  const showAnswer = (wordSurface, correctReading) => {
    setInputs(prev => ({ ...prev, [wordSurface]: correctReading }));
    setResults(prev => ({ ...prev, [wordSurface]: 'revealed' }));
    loadMeaning(wordSurface);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-gray-50 dark:bg-nihon-darker animate-in slide-in-from-bottom-4">
      <div className="flex-1 overflow-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto w-full glass-card-solid rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-nihon-border pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="text-3xl">📝</span> Chế độ luyện tập
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Luyện gõ cách đọc Hiragana cho các từ Kanji
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-nihon-dark dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition-colors font-medium"
            >
              ✕ Đóng
            </button>
          </div>

          {!isStarted ? (
            <div className="space-y-4 animate-in fade-in">
              <label className="block text-gray-700 dark:text-gray-200 font-medium">
                Nhập danh sách từ vựng cần luyện tập:
              </label>
              <textarea
                className="w-full h-48 p-4 bg-white dark:bg-nihon-dark border border-gray-200 dark:border-gray-700 rounded-xl text-lg text-gray-800 dark:text-white font-japanese resize-none focus:ring-2 focus:ring-sakura-500 outline-none"
                placeholder="Ví dụ: 食べる, 飲む, 走る... (có thể copy/paste cả đoạn văn, hệ thống sẽ tự tìm các chữ Kanji)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                onClick={handleStart}
                disabled={isLoading || !inputText.trim()}
                className="w-full py-3 bg-sakura-500 hover:bg-sakura-600 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 text-white text-lg font-medium rounded-xl transition-colors"
              >
                {isLoading ? 'Đang phân tích...' : 'Bắt đầu ngay'}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-300">
                  Hãy nhập Romaji, hệ thống sẽ tự động chuyển thành Hiragana!
                </p>
                <button
                  onClick={() => setIsStarted(false)}
                  className="text-sakura-600 hover:text-sakura-700 font-medium text-sm"
                >
                  ← Đổi danh sách
                </button>
              </div>

              {studyList.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">Không tìm thấy từ Kanji nào trong văn bản của bạn.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {studyList.map((word, idx) => {
                    const status = results[word.surface];
                    let borderClass = "border-gray-200 dark:border-nihon-border";
                    if (status === 'correct') borderClass = "border-green-500 ring-2 ring-green-500/50 shadow-green-500/20 shadow-lg";
                    if (status === 'incorrect') borderClass = "border-red-500 ring-2 ring-red-500/50 shadow-red-500/20 shadow-lg";
                    if (status === 'revealed') borderClass = "border-blue-500 ring-2 ring-blue-500/50 shadow-blue-500/20 shadow-lg";

                    const isDone = status === 'correct' || status === 'revealed';

                    return (
                      <div key={idx} className={`bg-white dark:bg-nihon-card p-5 rounded-2xl border ${borderClass} flex flex-col items-center justify-center text-center gap-4 transition-all duration-300`}>
                        <span className="text-4xl font-japanese font-bold text-gray-800 dark:text-white">
                          {word.surface}
                        </span>
                        
                        <div className="w-full relative">
                          <input
                            type="text"
                            className={`w-full text-center py-2 px-3 bg-gray-50 dark:bg-nihon-dark border rounded-lg text-lg font-japanese text-gray-800 dark:text-white focus:ring-2 focus:ring-sakura-500 outline-none transition-all ${
                              status === 'correct' ? 'border-green-500 text-green-700 dark:text-green-400' :
                              status === 'incorrect' ? 'border-red-500 text-red-600 dark:text-red-400' :
                              status === 'revealed' ? 'border-blue-500 text-blue-700 dark:text-blue-400' :
                              'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Nhập Romaji"
                            value={inputs[word.surface] || ''}
                            onChange={(e) => handleInputChange(word.surface, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') checkAnswer(word.surface, word.readingHiragana);
                            }}
                            disabled={isDone}
                          />
                        </div>
                        
                        {!isDone && (
                          <div className="flex gap-2 w-full mt-1">
                            <button
                              onClick={() => checkAnswer(word.surface, word.readingHiragana)}
                              className="flex-1 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-nihon-dark dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                            >
                              Kiểm tra
                            </button>
                            <button
                              onClick={() => showAnswer(word.surface, word.readingHiragana)}
                              className="flex-1 py-2 text-sm font-medium bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                            >
                              Xem kết quả
                            </button>
                          </div>
                        )}

                        {status === 'incorrect' && (
                          <div className="text-sm text-red-500 mt-1 font-japanese font-medium">
                            Hãy thử lại hoặc Xem kết quả
                          </div>
                        )}

                        {isDone && (
                          <div className="w-full text-sm mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg min-h-[50px] flex items-center justify-center font-medium shadow-inner">
                            {meanings[word.surface] || <span className="animate-pulse">Đang tải nghĩa...</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
