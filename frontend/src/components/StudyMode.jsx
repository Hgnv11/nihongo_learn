import { useState, useRef } from 'react';
import { toHiragana } from 'wanakana';

/**
 * Parse input lines in the format:
 *   快適（かいてき）: thoải mái → khoái thích
 *   kanji（cách đọc）: nghĩa → hán việt
 *
 * Supports both （）and () parentheses, and both → and ->
 * Returns array of { surface, readingHiragana, meaning, hanViet }
 */
function parseStudyInput(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const results = [];

  for (const line of lines) {
    // Pattern: KANJI（READING）: MEANING → HANVIET
    // Also support: KANJI(READING): MEANING -> HANVIET
    const match = line.match(
      /^(.+?)[（(](.+?)[）)]\s*[:：]\s*(.+?)\s*[→\->]+\s*(.+)$/
    );

    if (match) {
      results.push({
        surface: match[1].trim(),
        readingHiragana: match[2].trim(),
        meaning: match[3].trim(),
        hanViet: match[4].trim(),
      });
    } else {
      // Try simpler format without Hán Việt: KANJI（READING）: MEANING
      const match2 = line.match(
        /^(.+?)[（(](.+?)[）)]\s*[:：]\s*(.+)$/
      );
      if (match2) {
        results.push({
          surface: match2[1].trim(),
          readingHiragana: match2[2].trim(),
          meaning: match2[3].trim(),
          hanViet: '',
        });
      }
    }
  }

  return results;
}

export default function StudyMode({ onClose }) {
  const [inputText, setInputText] = useState('');
  const [studyList, setStudyList] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [results, setResults] = useState({}); // word -> 'correct' | 'incorrect' | 'revealed'
  const [inputs, setInputs] = useState({}); // word -> string
  const inputRefs = useRef([]);
  const fileInputRef = useRef(null);

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      setInputText(prev => prev ? prev + '\n' + content : content);
    };
    reader.readAsText(file, 'UTF-8');

    // Reset file input so the same file can be selected again
    e.target.value = '';
  };

  const handleStart = () => {
    if (!inputText.trim()) return;

    const parsed = parseStudyInput(inputText);

    if (parsed.length === 0) {
      alert('Không tìm thấy từ nào. Hãy nhập theo định dạng:\n快適（かいてき）: thoải mái → khoái thích');
      return;
    }

    setStudyList(parsed);
    setIsStarted(true);
    setResults({});
    setInputs({});
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

  const checkAnswer = (wordSurface, correctReading) => {
    const userAnswer = (inputs[wordSurface] || '').trim();
    if (!userAnswer) return;

    const isCorrect = userAnswer === correctReading;
    setResults(prev => ({
      ...prev,
      [wordSurface]: isCorrect ? 'correct' : 'incorrect'
    }));
  };

  const showAnswer = (wordSurface, correctReading) => {
    setInputs(prev => ({ ...prev, [wordSurface]: correctReading }));
    setResults(prev => ({ ...prev, [wordSurface]: 'revealed' }));
  };

  const resetAnswer = (wordSurface) => {
    setInputs(prev => ({ ...prev, [wordSurface]: '' }));
    setResults(prev => {
      const next = { ...prev };
      delete next[wordSurface];
      return next;
    });
  };

  // Stats
  const totalWords = studyList.length;
  const correctCount = Object.values(results).filter(r => r === 'correct').length;
  const revealedCount = Object.values(results).filter(r => r === 'revealed').length;
  const doneCount = correctCount + revealedCount;

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
              <div className="flex items-center justify-between">
                <label className="block text-gray-700 dark:text-gray-200 font-medium">
                  Nhập danh sách từ vựng cần luyện tập:
                </label>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv,.tsv"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
                >
                  📂 Import file
                </button>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold mb-1">📌 Định dạng nhập:</p>
                <code className="block bg-white dark:bg-nihon-dark px-3 py-2 rounded-lg mt-1 font-japanese text-base">
                  快適（かいてき）: thoải mái → khoái thích
                </code>
                <p className="mt-2 text-xs opacity-80">
                  Mỗi dòng 1 từ: <strong>Kanji（cách đọc）: nghĩa → hán việt</strong>
                </p>
              </div>
              <textarea
                className="w-full h-48 p-4 bg-white dark:bg-nihon-dark border border-gray-200 dark:border-gray-700 rounded-xl text-lg text-gray-800 dark:text-white font-japanese resize-none focus:ring-2 focus:ring-sakura-500 outline-none"
                placeholder={"快適（かいてき）: thoải mái → khoái thích\n安全（あんぜん）: an toàn → an toàn\n危険（きけん）: nguy hiểm → nguy hiểm"}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                onClick={handleStart}
                disabled={!inputText.trim()}
                className="w-full py-3 bg-sakura-500 hover:bg-sakura-600 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 text-white text-lg font-medium rounded-xl transition-colors"
              >
                Bắt đầu ngay
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <p className="text-gray-600 dark:text-gray-300">
                    Hãy nhập Romaji, hệ thống sẽ tự động chuyển thành Hiragana!
                  </p>
                  {totalWords > 0 && (
                    <span className="text-sm px-3 py-1 bg-sakura-50 dark:bg-sakura-900/20 text-sakura-600 dark:text-sakura-400 rounded-full font-medium">
                      {doneCount}/{totalWords} hoàn thành
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setResults({}); setInputs({}); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg transition-colors border border-amber-200 dark:border-amber-800"
                  >
                    🔄 Reset all
                  </button>
                  <button
                    onClick={() => { setIsStarted(false); setResults({}); setInputs({}); }}
                    className="text-sakura-600 hover:text-sakura-700 font-medium text-sm"
                  >
                    ← Đổi danh sách
                  </button>
                </div>
              </div>

              {studyList.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">Không tìm thấy từ nào trong danh sách.</p>
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
                            ref={(el) => (inputRefs.current[idx] = el)}
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
                              if (e.key === 'Enter') {
                                checkAnswer(word.surface, word.readingHiragana);
                              } else if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                let i = idx + 1;
                                while (i < inputRefs.current.length) {
                                  const el = inputRefs.current[i];
                                  if (el && !el.disabled) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); break; }
                                  i++;
                                }
                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                let i = idx - 1;
                                while (i >= 0) {
                                  const el = inputRefs.current[i];
                                  if (el && !el.disabled) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); break; }
                                  i--;
                                }
                              }
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
                          <div className="w-full flex flex-col gap-2 mt-1">
                            <div className="w-full text-sm p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-900 dark:text-blue-200 rounded-lg min-h-[52px] flex flex-col items-center justify-center gap-1.5 shadow-inner">
                              {/* Nghĩa tiếng Việt */}
                              <span className="font-medium text-center leading-snug">
                                🇻🇳 {word.meaning}
                              </span>
                              {/* Hán Việt */}
                              {word.hanViet && (
                                <span className="font-bold text-center leading-snug text-sakura-600 dark:text-sakura-400 uppercase tracking-wide text-xs">
                                  漢 {word.hanViet}
                                </span>
                              )}
                            </div>
                            {status === 'revealed' && (
                              <button
                                onClick={() => resetAnswer(word.surface)}
                                className="w-full py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-nihon-dark dark:hover:bg-gray-700 rounded transition-colors"
                              >
                                Làm lại
                              </button>
                            )}
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
