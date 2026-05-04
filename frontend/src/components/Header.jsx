export default function Header({ isDark, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-50 glass-card-solid border-b border-gray-200 dark:border-nihon-border px-6 py-3">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sakura-500 to-rose-400 flex items-center justify-center shadow-md">
            <span className="text-white text-lg font-bold font-japanese">学</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient leading-tight">
              Nihongo Learn
            </h1>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 tracking-wider uppercase">
              日本語学習
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            id="theme-toggle"
            onClick={onToggleTheme}
            className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-nihon-dark border border-gray-300 dark:border-nihon-border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sakura-400/50"
            aria-label="Chuyển chế độ sáng tối"
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white dark:bg-gray-700 shadow-md transition-all duration-300 flex items-center justify-center ${
                isDark ? 'left-[calc(100%-1.625rem)]' : 'left-0.5'
              }`}
            >
              {isDark ? (
                <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
