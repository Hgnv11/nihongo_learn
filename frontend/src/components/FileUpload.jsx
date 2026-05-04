import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useApp } from '../context/AppContext';
import { uploadFile, submitText } from '../services/api';

export default function FileUpload() {
  const { dispatch } = useApp();
  const [mode, setMode] = useState('upload'); // 'upload' | 'paste'
  const [pasteText, setPasteText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const processUpload = useCallback(
    async (file) => {
      setUploading(true);
      setError(null);
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const data = await uploadFile(file);
        dispatch({
          type: 'SET_DOCUMENT',
          payload: {
            rawText: data.rawText,
            tokens: data.tokens,
            sentences: data.sentences,
            stats: data.stats,
            fileName: file.name,
          },
        });
      } catch (err) {
        const message = err.response?.data?.error || 'Không thể xử lý tệp';
        setError(message);
        dispatch({ type: 'SET_ERROR', payload: message });
      } finally {
        setUploading(false);
      }
    },
    [dispatch]
  );

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        processUpload(acceptedFiles[0]);
      }
    },
    [processUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) return;

    setUploading(true);
    setError(null);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const data = await submitText(pasteText);
      dispatch({
        type: 'SET_DOCUMENT',
        payload: {
          rawText: data.rawText,
          tokens: data.tokens,
          sentences: data.sentences,
          stats: data.stats,
          fileName: 'Văn bản đã dán',
        },
      });
    } catch (err) {
      const message = err.response?.data?.error || 'Không thể xử lý văn bản';
      setError(message);
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      setUploading(false);
    }
  };

  const handleUseSample = async () => {
    const sampleText = `日本語を学ぶことは楽しいです。毎日新しい漢字を覚えています。東京は美しい都市です。桜の季節が一番好きです。日本の文化はとても興味深いです。寿司や天ぷらなどの日本料理が大好きです。将来、日本に住みたいと思っています。`;

    setPasteText(sampleText);
    setMode('paste');

    setUploading(true);
    setError(null);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const data = await submitText(sampleText);
      dispatch({
        type: 'SET_DOCUMENT',
        payload: {
          rawText: data.rawText,
          tokens: data.tokens,
          sentences: data.sentences,
          stats: data.stats,
          fileName: 'Văn bản mẫu',
        },
      });
    } catch (err) {
      const message = err.response?.data?.error || 'Không thể xử lý văn bản mẫu';
      setError(message);
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-sakura-500 to-rose-400 flex items-center justify-center shadow-glow-lg">
          <span className="text-white text-4xl font-japanese">読</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 font-japanese">
          日本語学習
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Tải lên tài liệu tiếng Nhật hoặc dán văn bản để học từ vựng và luyện viết Kanji
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex mb-6 bg-gray-100 dark:bg-nihon-dark rounded-xl p-1 border border-gray-200 dark:border-nihon-border">
        <button
          id="upload-tab"
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'upload'
              ? 'bg-white dark:bg-nihon-card text-sakura-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setMode('upload')}
        >
          📁 Tải tệp lên
        </button>
        <button
          id="paste-tab"
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'paste'
              ? 'bg-white dark:bg-nihon-card text-sakura-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setMode('paste')}
        >
          ✏️ Dán văn bản
        </button>
      </div>

      {/* Upload Area */}
      {mode === 'upload' && (
        <div
          {...getRootProps()}
          className={`w-full max-w-lg glass-card p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-sakura-400 dark:border-sakura-500 bg-sakura-50/50 dark:bg-sakura-900/10 scale-[1.02]'
              : 'hover:border-sakura-300 dark:hover:border-sakura-600 hover:shadow-glow'
          } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} id="file-input" />
          <div className="mb-4">
            <svg
              className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-sakura-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Đang xử lý tài liệu...</p>
            </div>
          ) : isDragActive ? (
            <p className="text-sakura-600 dark:text-sakura-400 font-medium">
              Thả tệp vào đây...
            </p>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">
                Kéo thả tệp vào đây hoặc bấm để chọn
              </p>
              <p className="text-xs text-gray-400">
                Hỗ trợ TXT, PDF, DOCX • Tối đa 10MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Paste Area */}
      {mode === 'paste' && (
        <div className="w-full max-w-lg glass-card p-6">
          <textarea
            id="paste-input"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Dán văn bản tiếng Nhật vào đây..."
            className="w-full h-40 p-4 bg-gray-50 dark:bg-nihon-dark rounded-xl border border-gray-200 dark:border-nihon-border text-gray-800 dark:text-gray-200 font-japanese resize-none focus:outline-none focus:ring-2 focus:ring-sakura-400/50 placeholder-gray-400 transition-all"
            disabled={uploading}
          />
          <button
            id="paste-submit"
            onClick={handlePasteSubmit}
            disabled={!pasteText.trim() || uploading}
            className="w-full mt-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </span>
            ) : (
              'Phân tích văn bản'
            )}
          </button>
        </div>
      )}

      {/* Sample button */}
      <button
        id="sample-btn"
        onClick={handleUseSample}
        className="mt-4 btn-ghost text-sm"
        disabled={uploading}
      >
        ✨ Dùng văn bản mẫu
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm max-w-lg w-full animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
}
