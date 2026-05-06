import { useState } from 'react';

// Highlight the searched keyword inside a sentence token list
function SentenceDisplay({ tokens, text, targetWord, showFurigana }) {
  if (!tokens) {
    // No tokens, just plain text with keyword highlighted
    if (!text) return null;
    const parts = text.split(new RegExp(`(${targetWord})`, 'g'));
    return (
      <span>
        {parts.map((part, i) =>
          part === targetWord ? (
            <mark key={i} className="bg-sakura-100 dark:bg-sakura-900/40 text-sakura-700 dark:text-sakura-300 rounded px-0.5 not-italic font-bold">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  }

  return (
    <>
      {tokens.map((token, idx) => {
        const isTarget = token.surface === targetWord ||
          (targetWord && token.surface.includes(targetWord));
        const hasFurigana =
          token.hasKanji &&
          token.readingHiragana &&
          token.readingHiragana !== token.surface;

        const baseClass = isTarget
          ? 'bg-sakura-100 dark:bg-sakura-900/40 text-sakura-700 dark:text-sakura-300 rounded px-0.5 font-bold'
          : '';

        if (hasFurigana) {
          return (
            <ruby key={idx} className={`mr-0.5 cursor-default ${baseClass}`}>
              {token.surface}
              <rt className={`text-[10px] select-none transition-opacity duration-200 ${
                showFurigana ? 'opacity-80 text-gray-500' : 'opacity-0'
              }`}>
                {token.readingHiragana}
              </rt>
            </ruby>
          );
        }

        return (
          <span key={idx} className={baseClass}>
            {token.surface}
          </span>
        );
      })}
    </>
  );
}

export default function ExampleSentences({ sentences, targetWord }) {
  const [showFurigana, setShowFurigana] = useState(true);
  const [hiddenTranslations, setHiddenTranslations] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  if (!sentences || sentences.length === 0) {
    return (
      <div className="text-center py-8 animate-in">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Không tìm thấy câu ví dụ</p>
        <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">
          Thử chọn một từ khác để xem ví dụ
        </p>
      </div>
    );
  }

  const toggleTranslation = (id) => {
    setHiddenTranslations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  return (
    <div className="space-y-4 animate-in">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">Câu ví dụ ({sentences.length})</h3>
        <button
          onClick={() => setShowFurigana(f => !f)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            showFurigana
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
              : 'bg-gray-100 dark:bg-nihon-dark text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
          }`}
        >
          <span className="font-japanese text-sm">あ</span>
          {showFurigana ? 'Ẩn furigana' : 'Hiện furigana'}
        </button>
      </div>

      {sentences.map((sentence, i) => {
        const id = sentence.id || i;
        const isTranslationHidden = hiddenTranslations[id];
        const isCopied = copiedId === id;

        return (
          <div
            key={id}
            className="group glass-card-solid p-4 rounded-xl hover:shadow-md transition-all duration-200 border border-transparent hover:border-sakura-200 dark:hover:border-sakura-900/50"
          >
            {/* Top row: number + badges + copy */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sakura-100 dark:bg-sakura-900/30 text-sakura-600 dark:text-sakura-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                {sentence.isFallback ? (
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded font-medium border border-amber-200 dark:border-amber-800">
                    Tự động
                  </span>
                ) : (
                  <>
                    <span className="text-[10px] px-1.5 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded font-medium border border-green-200 dark:border-green-800">
                      Tatoeba
                    </span>
                    {sentence.translationLang && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                        sentence.translationLang === 'vie'
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                          : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                      }`}>
                        {sentence.translationLang === 'vie' ? '🇻🇳 VI' : '🇬🇧 EN'}
                      </span>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={() => handleCopy(sentence.text, id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-nihon-dark transition-all text-xs"
                title="Sao chép câu"
              >
                {isCopied ? '✓' : '📋'}
              </button>
            </div>

            {/* Japanese sentence */}
            <p className="text-base font-japanese text-gray-800 dark:text-gray-200 leading-loose mb-3">
              <SentenceDisplay
                tokens={sentence.tokens}
                text={sentence.text}
                targetWord={targetWord}
                showFurigana={showFurigana}
              />
            </p>

            {/* Translation toggle */}
            {sentence.translation && (
              <div>
                <button
                  onClick={() => toggleTranslation(id)}
                  className="text-xs text-gray-400 hover:text-sakura-500 transition-colors mb-1.5 flex items-center gap-1"
                >
                  {isTranslationHidden ? '👁 Hiện dịch' : '🙈 Ẩn dịch'}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isTranslationHidden ? 'max-h-0 opacity-0' : 'max-h-40 opacity-100'}`}>
                  <p className="text-sm text-gray-500 dark:text-gray-400 pl-3 border-l-2 border-sakura-300 dark:border-sakura-700 leading-relaxed">
                    {sentence.translation}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
