import { createContext, useContext, useReducer, useCallback } from 'react';

const AppContext = createContext(null);

const initialState = {
  // Document state
  rawText: '',
  tokens: [],
  sentences: [],
  stats: null,
  fileName: '',
  isLoading: false,
  error: null,

  // Selected word
  selectedWord: null,
  selectedTokenIndex: null,

  // Word data (from API)
  wordData: null,
  kanjiData: {},
  exampleSentences: [],
  wordLoading: false,

  // UI state
  isPanelOpen: false,
  activeTab: 'info', // 'info' | 'kanji' | 'practice' | 'examples'

  // Learning data
  bookmarks: JSON.parse(localStorage.getItem('nihongo-bookmarks') || '[]'),
  history: JSON.parse(localStorage.getItem('nihongo-history') || '[]'),
  srsCards: JSON.parse(localStorage.getItem('nihongo-srs') || '[]'),
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_DOCUMENT':
      return {
        ...state,
        rawText: action.payload.rawText,
        tokens: action.payload.tokens,
        sentences: action.payload.sentences,
        stats: action.payload.stats,
        fileName: action.payload.fileName || '',
        isLoading: false,
        error: null,
        selectedWord: null,
        selectedTokenIndex: null,
        isPanelOpen: false,
        wordData: null,
        kanjiData: {},
        exampleSentences: [],
      };

    case 'CLEAR_DOCUMENT':
      return {
        ...state,
        rawText: '',
        tokens: [],
        sentences: [],
        stats: null,
        fileName: '',
        selectedWord: null,
        selectedTokenIndex: null,
        isPanelOpen: false,
        wordData: null,
        kanjiData: {},
        exampleSentences: [],
      };

    case 'SELECT_WORD':
      return {
        ...state,
        selectedWord: action.payload.word,
        selectedTokenIndex: action.payload.index,
        isPanelOpen: true,
        wordLoading: true,
        wordData: null,
        kanjiData: {},
        exampleSentences: [],
        activeTab: 'info',
      };

    case 'SET_WORD_DATA':
      return {
        ...state,
        wordData: action.payload,
        wordLoading: false,
      };

    case 'SET_KANJI_DATA':
      return {
        ...state,
        kanjiData: {
          ...state.kanjiData,
          [action.payload.kanji]: action.payload.data,
        },
      };

    case 'SET_EXAMPLE_SENTENCES':
      return {
        ...state,
        exampleSentences: action.payload,
      };

    case 'SET_WORD_LOADING':
      return { ...state, wordLoading: action.payload };

    case 'CLOSE_PANEL':
      return {
        ...state,
        isPanelOpen: false,
        selectedWord: null,
        selectedTokenIndex: null,
      };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'TOGGLE_BOOKMARK': {
      const word = action.payload;
      const exists = state.bookmarks.find((b) => b.surface === word.surface);
      const newBookmarks = exists
        ? state.bookmarks.filter((b) => b.surface !== word.surface)
        : [...state.bookmarks, { ...word, addedAt: Date.now() }];
      localStorage.setItem('nihongo-bookmarks', JSON.stringify(newBookmarks));
      return { ...state, bookmarks: newBookmarks };
    }

    case 'ADD_TO_HISTORY': {
      const word = action.payload;
      const filtered = state.history.filter((h) => h.surface !== word.surface);
      const newHistory = [{ ...word, viewedAt: Date.now() }, ...filtered].slice(0, 100);
      localStorage.setItem('nihongo-history', JSON.stringify(newHistory));
      return { ...state, history: newHistory };
    }

    case 'ADD_SRS_CARD': {
      const card = action.payload;
      const existingIndex = state.srsCards.findIndex((c) => c.surface === card.surface);
      let newCards;
      if (existingIndex >= 0) {
        newCards = [...state.srsCards];
        newCards[existingIndex] = { ...newCards[existingIndex], ...card };
      } else {
        newCards = [
          ...state.srsCards,
          {
            ...card,
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
            nextReview: Date.now(),
            addedAt: Date.now(),
          },
        ];
      }
      localStorage.setItem('nihongo-srs', JSON.stringify(newCards));
      return { ...state, srsCards: newCards };
    }

    case 'UPDATE_SRS_CARD': {
      const { surface, quality } = action.payload;
      const newCards = state.srsCards.map((card) => {
        if (card.surface !== surface) return card;

        // SM-2 algorithm
        let { interval, easeFactor, repetitions } = card;

        if (quality >= 3) {
          if (repetitions === 0) interval = 1;
          else if (repetitions === 1) interval = 6;
          else interval = Math.round(interval * easeFactor);
          repetitions += 1;
        } else {
          repetitions = 0;
          interval = 1;
        }

        easeFactor = Math.max(
          1.3,
          easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        return {
          ...card,
          interval,
          easeFactor,
          repetitions,
          nextReview: Date.now() + interval * 24 * 60 * 60 * 1000,
          lastReviewed: Date.now(),
        };
      });

      localStorage.setItem('nihongo-srs', JSON.stringify(newCards));
      return { ...state, srsCards: newCards };
    }

    case 'CLEAR_HISTORY':
      localStorage.setItem('nihongo-history', '[]');
      return { ...state, history: [] };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export default AppContext;
