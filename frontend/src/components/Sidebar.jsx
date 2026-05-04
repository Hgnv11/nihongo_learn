import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getKanaForms } from '../utils/kana';

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const { bookmarks, history, srsCards } = state;
  const [activeSection, setActiveSection] = useState('bookmarks');

  const dueCards = srsCards.filter((card) => card.nextReview <= Date.now());

  const sections = [
    { id: 'bookmarks', label: '★', title: 'Đã đánh dấu', count: bookmarks.length },
    { id: 'history', label: '⏱', title: 'Lịch sử', count: history.length },
    { id: 'srs', label: '🔄', title: 'Ôn tập', count: dueCards.length },
  ];

  const handleClickWord = (word) => {
    const kana = getKanaForms(word);

    dispatch({
      type: 'SELECT_WORD',
      payload: {
        word: {
          surface: word.surface,
          reading: word.reading || '',
          readingHiragana: kana.hiragana,
          readingKatakana: kana.katakana,
          baseForm: word.baseForm || word.surface,
          isJapanese: true,
          hasKanji: /[\u4E00-\u9FAF]/.test(word.surface),
          kanjiChars: word.surface.split('').filter((c) => /[\u4E00-\u9FAF]/.test(c)),
          pos: '',
        },
        index: -1,
      },
    });
  };

  const handleReview = (card, quality) => {
    dispatch({
      type: 'UPDATE_SRS_CARD',
      payload: { surface: card.surface, quality },
    });
  };

  return (
    <div className="w-14 bg-white dark:bg-nihon-card border-r border-gray-200 dark:border-nihon-border flex flex-col items-center py-4 gap-1 flex-shrink-0">
      {sections.map((section) => (
        <button
          key={section.id}
          id={`sidebar-${section.id}`}
          className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all ${
            activeSection === section.id
              ? 'bg-sakura-50 dark:bg-sakura-900/20 text-sakura-600'
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-nihon-dark hover:text-gray-600 dark:hover:text-gray-300'
          }`}
          onClick={() =>
            setActiveSection(activeSection === section.id ? null : section.id)
          }
          title={section.title}
        >
          {section.label}
          {section.count > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-sakura-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {section.count > 9 ? '9+' : section.count}
            </span>
          )}
        </button>
      ))}

      {/* Expandable panel */}
      {activeSection && (
        <SidebarPanel
          activeSection={activeSection}
          bookmarks={bookmarks}
          history={history}
          srsCards={srsCards}
          dueCards={dueCards}
          onClickWord={handleClickWord}
          onReview={handleReview}
          onClearHistory={() => dispatch({ type: 'CLEAR_HISTORY' })}
          onClose={() => setActiveSection(null)}
        />
      )}
    </div>
  );
}

function SidebarPanel({
  activeSection,
  bookmarks,
  history,
  srsCards,
  dueCards,
  onClickWord,
  onReview,
  onClearHistory,
  onClose,
}) {
  return (
    <div className="fixed left-14 top-[57px] bottom-0 w-64 bg-white dark:bg-nihon-card border-r border-gray-200 dark:border-nihon-border z-40 animate-slide-in overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-nihon-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {activeSection === 'bookmarks' && '★ Đã đánh dấu'}
          {activeSection === 'history' && '⏱ Lịch sử'}
          {activeSection === 'srs' && '🔄 Ôn tập'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeSection === 'bookmarks' && (
          <WordList
            items={bookmarks}
            emptyMessage="Chưa có từ nào được đánh dấu"
            onClickWord={onClickWord}
          />
        )}

        {activeSection === 'history' && (
          <>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[10px] text-gray-400 hover:text-red-500 mb-2"
              >
                Xóa lịch sử
              </button>
            )}
            <WordList
              items={history}
              emptyMessage="Chưa xem từ nào"
              onClickWord={onClickWord}
            />
          </>
        )}

        {activeSection === 'srs' && (
          <div className="space-y-2">
            {dueCards.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                {srsCards.length === 0
                  ? 'Chưa có thẻ ôn tập. Thêm từ bằng nút 🔄.'
                  : 'Đã xong. Hiện không có thẻ cần ôn.'}
              </p>
            ) : (
              dueCards.map((card) => (
                <div
                  key={card.surface}
                  className="p-3 bg-gray-50 dark:bg-nihon-dark rounded-xl border border-gray-200 dark:border-nihon-border"
                >
                  <p className="font-japanese text-lg text-center mb-1">{card.surface}</p>
                  {card.meaning && (
                    <p className="text-xs text-gray-500 text-center mb-2">{card.meaning}</p>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => onReview(card, 1)}
                      className="flex-1 py-1 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg"
                    >
                      Lại
                    </button>
                    <button
                      onClick={() => onReview(card, 3)}
                      className="flex-1 py-1 text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg"
                    >
                      Khó
                    </button>
                    <button
                      onClick={() => onReview(card, 4)}
                      className="flex-1 py-1 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg"
                    >
                      Ổn
                    </button>
                    <button
                      onClick={() => onReview(card, 5)}
                      className="flex-1 py-1 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"
                    >
                      Dễ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WordList({ items, emptyMessage, onClickWord }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-4">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <WordListItem key={`${item.surface}-${i}`} item={item} onClickWord={onClickWord} />
      ))}
    </div>
  );
}

function WordListItem({ item, onClickWord }) {
  const kana = getKanaForms(item);
  const reading = kana.hiragana || item.reading;

  return (
    <button
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-nihon-dark transition-colors flex items-center gap-2"
      onClick={() => onClickWord(item)}
    >
      <span className="font-japanese text-sm font-medium text-gray-800 dark:text-gray-200">
        {item.surface}
      </span>
      {reading && (
        <span className="text-[10px] text-gray-400 font-japanese break-all">{reading}</span>
      )}
    </button>
  );
}
