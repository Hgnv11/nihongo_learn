import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

export default function Login({ onLogin }) {
  const { isDark, toggle } = useTheme();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'hoangfpt') {
      sessionStorage.setItem('isAuthenticated', 'true');
      onLogin();
    } else {
      setError('Mật khẩu không đúng. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-nihon-darker transition-colors duration-300 px-4 relative">
      <div className="absolute top-6 right-6">
        <button
          onClick={toggle}
          className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-nihon-dark border border-gray-300 dark:border-nihon-border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sakura-400/50"
          aria-label="Toggle dark mode"
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

      <div className="max-w-md w-full glass-card p-8 text-center animate-fade-in shadow-lg">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-sakura-500 to-rose-400 flex items-center justify-center shadow-glow">
          <span className="text-white text-3xl font-bold font-japanese">鍵</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Xác thực truy cập
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
          Vui lòng nhập mật khẩu để truy cập Nihongo Learn
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Nhập mật khẩu..."
              className="w-full px-4 py-3 bg-white dark:bg-nihon-dark rounded-xl border border-gray-200 dark:border-nihon-border text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sakura-400/50 transition-all text-center font-medium"
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm animate-fade-in">{error}</p>
          )}

          <button
            type="submit"
            className="w-full btn-primary font-bold py-3 mt-4"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}
