import { useApp } from '../context/AppContext';
import KanjiWriter from './KanjiWriter';
import ExampleSentences from './ExampleSentences';
import { getKanaForms } from '../utils/kana';

export default function WordPanel() {
  const { state, dispatch } = useApp();
  const {
    selectedWord,
    wordData,
    kanjiData,
    exampleSentences,
    wordLoading,
    activeTab,
    bookmarks,
    isPanelOpen,
  } = state;

  if (!isPanelOpen || !selectedWord) return null;

  const isBookmarked = bookmarks.some((b) => b.surface === selectedWord.surface);
  const selectedKana = getKanaForms(selectedWord);

  const handleBookmark = () => {
    dispatch({
      type: 'TOGGLE_BOOKMARK',
      payload: {
        surface: selectedWord.surface,
        reading: selectedWord.reading,
        readingHiragana: selectedKana.hiragana,
        readingKatakana: selectedKana.katakana,
        baseForm: selectedWord.baseForm,
      },
    });
  };

  const handleAddToSRS = () => {
    dispatch({
      type: 'ADD_SRS_CARD',
      payload: {
        surface: selectedWord.surface,
        reading: selectedWord.reading,
        readingHiragana: selectedKana.hiragana,
        readingKatakana: selectedKana.katakana,
        baseForm: selectedWord.baseForm,
        meaning: wordData?.results?.[0]?.senses?.[0]?.englishDefinitions?.join(', ') || '',
      },
    });
  };

  const handleClose = () => {
    dispatch({ type: 'CLOSE_PANEL' });
  };

  const setTab = (tab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  // Extract JLPT level from word data
  const jlptLevel = wordData?.results?.[0]?.jlpt?.[0] || null;
  const jlptClass = jlptLevel
    ? `jlpt-${jlptLevel.replace('jlpt-', '')}`
    : '';

  const tabs = [
    { id: 'info', label: '📖 Thông tin', icon: '📖' },
    { id: 'kanji', label: '漢 Kanji', icon: '漢' },
    { id: 'practice', label: '✍️ Luyện viết', icon: '✍️' },
    { id: 'examples', label: '💬 Ví dụ', icon: '💬' },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-nihon-card animate-slide-in">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-nihon-border">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <span className="text-3xl font-bold font-japanese text-gray-800 dark:text-gray-100">
              {selectedWord.surface}
            </span>
            {(selectedKana.hiragana || selectedKana.katakana) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                <KanaChip label="Hiragana" value={selectedKana.hiragana} />
                <KanaChip label="Katakana" value={selectedKana.katakana} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              id="bookmark-btn"
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-all ${
                isBookmarked
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                  : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-nihon-dark'
              }`}
              title={isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu từ này'}
            >
              {isBookmarked ? '★' : '☆'}
            </button>
            <button
              id="srs-btn"
              onClick={handleAddToSRS}
              className="p-2 rounded-lg text-gray-400 hover:text-sakura-500 hover:bg-gray-100 dark:hover:bg-nihon-dark transition-all"
              title="Thêm vào bộ ôn tập"
            >
              🔄
            </button>
            <button
              id="close-panel-btn"
              onClick={handleClose}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-nihon-dark transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* JLPT Badge & POS */}
        <div className="flex items-center gap-2 flex-wrap">
          {jlptLevel && (
            <span className={`jlpt-badge ${jlptClass}`}>
              {jlptLevel.toUpperCase().replace('-', '')}
            </span>
          )}
          {wordData?.results?.[0]?.isCommon && (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              Thường gặp
            </span>
          )}
          {selectedWord.pos && (
            <span className="px-2 py-0.5 rounded-md text-xs bg-gray-100 dark:bg-nihon-dark text-gray-500">
              {selectedWord.pos}
              {selectedWord.posDetail1 && selectedWord.posDetail1 !== '*'
                ? ` · ${selectedWord.posDetail1}`
                : ''}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-3 pt-2 border-b border-gray-200 dark:border-nihon-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-all ${
              activeTab === tab.id
                ? 'text-sakura-600 dark:text-sakura-400 border-b-2 border-sakura-500 bg-sakura-50/50 dark:bg-sakura-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {wordLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-sakura-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">Đang tải dữ liệu từ...</p>
          </div>
        ) : (
          <>
            {activeTab === 'info' && <InfoTab wordData={wordData} word={selectedWord} />}
            {activeTab === 'kanji' && (
              <KanjiTab word={selectedWord} kanjiData={kanjiData} dispatch={dispatch} />
            )}
            {activeTab === 'practice' && <KanjiWriter word={selectedWord} />}
            {activeTab === 'examples' && <ExampleSentences sentences={exampleSentences} />}
          </>
        )}
      </div>
    </div>
  );
}

function KanaChip({ label, value }) {
  if (!value) return null;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-nihon-border bg-gray-50 dark:bg-nihon-dark px-3 py-2 min-w-0">
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <span className="block font-japanese text-sm text-gray-700 dark:text-gray-200 break-all">
        {value}
      </span>
    </div>
  );
}

const posTranslations = {
  'Noun': 'Danh từ',
  'Pronoun': 'Đại từ',
  'Adjective': 'Tính từ',
  'Na-adjective': 'Tính từ -na',
  'I-adjective': 'Tính từ -i',
  'Verb': 'Động từ',
  'Suru verb': 'Động từ suru',
  'Ichidan verb': 'Động từ nhóm 2 (Ichidan)',
  'Godan verb': 'Động từ nhóm 1 (Godan)',
  'Intransitive verb': 'Tự động từ',
  'Transitive verb': 'Tha động từ',
  'Adverb': 'Trạng từ',
  'Particle': 'Trợ từ',
  'Conjunction': 'Liên từ',
  'Interjection': 'Thán từ',
  'Suffix': 'Hậu tố',
  'Prefix': 'Tiền tố',
  'Expression': 'Cụm từ',
  'Wikipedia definition': 'Wikipedia',
  'Numeric': 'Số từ',
  'Counter': 'Lượng từ',
  'Noun - used as a suffix': 'Danh từ - hậu tố',
  'Noun - used as a prefix': 'Danh từ - tiền tố',
};

function translateTag(tag) {
  if (!tag) return '';
  if (posTranslations[tag]) return posTranslations[tag];
  
  for (const [en, vi] of Object.entries(posTranslations)) {
    if (tag.toLowerCase().includes(en.toLowerCase())) {
      return vi;
    }
  }
  return tag;
}

/* ---- Info Tab ---- */
function InfoTab({ wordData, word }) {
  const wordKana = getKanaForms(word);

  if (!wordData?.results?.length) {
    return (
      <div className="py-8 space-y-4">
        <p className="text-gray-400 text-sm">Không tìm thấy dữ liệu từ điển cho từ này.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <KanaChip label="Hiragana" value={wordKana.hiragana} />
          <KanaChip label="Katakana" value={wordKana.katakana} />
        </div>
        <p className="text-gray-300 dark:text-gray-600 text-xs mt-2">
          Dạng gốc: {word.baseForm}
        </p>
      </div>
    );
  }

  const entry = wordData.results[0];

  return (
    <div className="space-y-5 animate-in">
      {/* Readings */}
      {entry.japanese.length > 0 && (
        <div>
          <h3 className="section-title">Cách đọc</h3>
          <div className="flex flex-wrap gap-2">
            {entry.japanese.map((j, i) => {
              const kana = getKanaForms({
                reading: j.reading,
                readingHiragana: j.readingHiragana,
                readingKatakana: j.readingKatakana,
                surface: j.word,
              });

              return (
                <div
                  key={i}
                  className="px-3 py-2 bg-gray-50 dark:bg-nihon-dark rounded-lg border border-gray-200 dark:border-nihon-border min-w-[180px]"
                >
                  {j.word && (
                    <span className="font-japanese text-lg font-medium text-gray-800 dark:text-gray-200">
                      {j.word}
                    </span>
                  )}
                  <div className="mt-2 space-y-1">
                    <KanaLine label="Hira" value={kana.hiragana} />
                    <KanaLine label="Kata" value={kana.katakana} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Definitions */}
      <div>
        <h3 className="section-title">Nghĩa</h3>
        <div className="space-y-3">
          {entry.senses.map((sense, i) => (
            <div
              key={i}
              className="pl-4 border-l-2 border-sakura-300 dark:border-sakura-700"
            >
              {sense.partsOfSpeech.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {sense.partsOfSpeech.map((pos, j) => (
                    <span
                      key={j}
                      className="text-[10px] font-medium text-sakura-600 dark:text-sakura-400 uppercase"
                    >
                      {translateTag(pos)}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="text-gray-400 mr-2 font-mono text-xs">{i + 1}.</span>
                {sense.englishDefinitions.join('; ')}
              </p>
              {sense.tags.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {sense.tags.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div>
          <h3 className="section-title">Nhãn</h3>
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-nihon-dark text-gray-500 rounded-md"
              >
                {translateTag(tag)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KanaLine({ label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-baseline gap-2 min-w-0">
      <span className="w-8 flex-shrink-0 text-[10px] font-bold uppercase text-gray-400">
        {label}
      </span>
      <span className="font-japanese text-sm text-gray-600 dark:text-gray-300 break-all">
        {value}
      </span>
    </div>
  );
}

/* ---- Kanji Tab ---- */
function KanjiTab({ word, kanjiData }) {
  if (!word.kanjiChars || word.kanjiChars.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm">Từ này không có ký tự kanji.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in">
      <h3 className="section-title">Phân tích Kanji</h3>
      <div className="grid gap-3">
        {word.kanjiChars.map((kanji) => {
          const data = kanjiData[kanji];
          const detail = data?.detail;

          return (
            <div
              key={kanji}
              className="glass-card-solid p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Kanji character */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sakura-50 to-rose-50 dark:from-sakura-900/20 dark:to-rose-900/20 flex items-center justify-center border border-sakura-200 dark:border-sakura-800/50 flex-shrink-0">
                  <span className="text-3xl font-japanese text-gray-800 dark:text-gray-200">
                    {kanji}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  {detail ? (
                    <>
                      {/* Meanings */}
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {detail.meanings.join(', ')}
                      </p>

                      {/* Readings */}
                      <div className="space-y-1">
                        {detail.onReadings.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase w-8">ON</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400 font-japanese">
                              {detail.onReadings.join('、')}
                            </span>
                          </div>
                        )}
                        {detail.kunReadings.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase w-8">KUN</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400 font-japanese">
                              {detail.kunReadings.join('、')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-2 mt-2">
                        {detail.strokeCount && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-nihon-dark rounded text-gray-500">
                            {detail.strokeCount} nét
                          </span>
                        )}
                        {detail.grade && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-500">
                            Lớp {detail.grade}
                          </span>
                        )}
                        {detail.jlpt && (
                          <span className={`jlpt-badge text-[10px] jlpt-n${detail.jlpt}`}>
                            N{detail.jlpt}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">Đang tải thông tin kanji...</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
