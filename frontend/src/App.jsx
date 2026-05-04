import { useState, useRef, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useTheme } from './hooks/useTheme';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import TextViewer from './components/TextViewer';
import WordPanel from './components/WordPanel';
import Sidebar from './components/Sidebar';
import Login from './components/Login';

function AppContent() {
  const { isDark, toggle } = useTheme();
  const { state } = useApp();
  const { tokens, isPanelOpen, isLoading } = state;

  const hasDocument = tokens.length > 0;

  // Panel Resizing Logic
  const [panelWidth, setPanelWidth] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      let newWidth = window.innerWidth - e.clientX;
      if (newWidth < 350) newWidth = 350;
      if (newWidth > window.innerWidth - 300) newWidth = window.innerWidth - 300;
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startDragging = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-nihon-darker transition-colors duration-300">
      <Header isDark={isDark} onToggleTheme={toggle} />

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="glass-card-solid px-8 py-6 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-sakura-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Đang xử lý tài liệu...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {hasDocument ? (
          <>
            {/* Sidebar */}
            <Sidebar />

            {/* Text Viewer */}
            <div
              className={`flex-1 overflow-hidden ${
                isDragging ? '' : 'transition-all duration-300'
              } ${isPanelOpen ? 'mr-0' : ''}`}
            >
              <div className="h-full bg-white dark:bg-nihon-dark">
                <TextViewer />
              </div>
            </div>

            {/* Resizer Handle */}
            {isPanelOpen && (
              <div
                onMouseDown={startDragging}
                className={`w-1.5 cursor-col-resize hover:bg-sakura-400 active:bg-sakura-500 transition-colors z-10 flex-shrink-0 flex items-center justify-center group ${
                  isDragging ? 'bg-sakura-500' : 'bg-gray-200 dark:bg-nihon-border'
                }`}
              >
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-0.5 h-1 bg-white rounded-full"></div>
                  <div className="w-0.5 h-1 bg-white rounded-full"></div>
                  <div className="w-0.5 h-1 bg-white rounded-full"></div>
                </div>
              </div>
            )}

            {/* Word Analysis Panel */}
            {isPanelOpen && (
              <div
                style={{ width: `${panelWidth}px` }}
                className={`flex-shrink-0 overflow-hidden bg-white dark:bg-nihon-card ${
                  isDragging ? '' : 'transition-all duration-300'
                }`}
              >
                <WordPanel />
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 overflow-auto">
            <FileUpload />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-2 border-t border-gray-200 dark:border-nihon-border bg-white/50 dark:bg-nihon-card/50 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between text-[10px] text-gray-400">
          <span>Nihongo Learn — Học từ vựng tiếng Nhật & luyện viết Kanji</span>
          <span>
            Dữ liệu từ Jisho · Tatoeba · KanjiVG
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isAuthenticated') === 'true'
  );

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
