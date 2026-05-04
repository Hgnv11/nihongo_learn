import { useRef, useState, useEffect, useCallback } from 'react';
import { getKanjiStrokes, getKanjiSvgUrl } from '../services/api';

export default function KanjiWriter({ word }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [strokeData, setStrokeData] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [penColor, setPenColor] = useState('#1a1a2e');
  const [penSize, setPenSize] = useState(4);
  const animationRef = useRef(null);
  const pathsRef = useRef([]);
  const currentPathRef = useRef([]);

  const kanjiChars = word?.kanjiChars || [];

  // Select first kanji by default
  useEffect(() => {
    if (kanjiChars.length > 0 && !selectedKanji) {
      setSelectedKanji(kanjiChars[0]);
    }
  }, [kanjiChars, selectedKanji]);

  // Fetch stroke data when kanji changes
  useEffect(() => {
    if (!selectedKanji) return;

    setStrokeData(null);
    setCurrentStroke(0);

    getKanjiStrokes(selectedKanji)
      .then((data) => {
        setStrokeData(data);
      })
      .catch((err) => {
        console.warn('Không thể tải dữ liệu thứ tự nét:', err);
      });
  }, [selectedKanji]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    clearCanvas();
  }, [selectedKanji]);

  // Detect dark mode for pen color
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setPenColor(isDark ? '#e5e7eb' : '#1a1a2e');
  }, []);

  const getPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const pos = getPosition(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;

    currentPathRef.current = [pos];
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const pos = getPosition(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    currentPathRef.current.push(pos);
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e?.preventDefault();

    if (currentPathRef.current.length > 0) {
      pathsRef.current.push([...currentPathRef.current]);
    }
    currentPathRef.current = [];
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw grid lines for guidance
    ctx.strokeStyle = document.documentElement.classList.contains('dark')
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Horizontal center
    ctx.beginPath();
    ctx.moveTo(0, rect.height / 2);
    ctx.lineTo(rect.width, rect.height / 2);
    ctx.stroke();

    // Vertical center
    ctx.beginPath();
    ctx.moveTo(rect.width / 2, 0);
    ctx.lineTo(rect.width / 2, rect.height);
    ctx.stroke();

    // Diagonals
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(rect.width, rect.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rect.width, 0);
    ctx.lineTo(0, rect.height);
    ctx.stroke();

    ctx.setLineDash([]);

    pathsRef.current = [];
    currentPathRef.current = [];
  };

  const undoStroke = () => {
    if (pathsRef.current.length === 0) return;
    pathsRef.current.pop();
    redrawCanvas();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    clearCanvas();

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    pathsRef.current.forEach((path) => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      path.forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.stroke();
    });
  };

  // Stroke animation
  const animateStrokes = useCallback(() => {
    if (!strokeData?.strokes?.length) return;

    setAnimating(true);
    setCurrentStroke(0);

    let strokeIndex = 0;
    const totalStrokes = strokeData.strokes.length;

    const animateNext = () => {
      if (strokeIndex >= totalStrokes) {
        setAnimating(false);
        return;
      }

      setCurrentStroke(strokeIndex + 1);
      strokeIndex++;

      animationRef.current = setTimeout(animateNext, 800);
    };

    animateNext();
  }, [strokeData]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  if (kanjiChars.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm">Không có ký tự kanji để luyện viết.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in">
      {/* Kanji selector */}
      {kanjiChars.length > 1 && (
        <div>
          <h3 className="section-title">Chọn Kanji</h3>
          <div className="flex gap-2">
            {kanjiChars.map((k) => (
              <button
                key={k}
                className={`kanji-grid-item w-14 h-14 ${
                  selectedKanji === k
                    ? 'border-sakura-400 dark:border-sakura-600 bg-sakura-50 dark:bg-sakura-900/20'
                    : ''
                }`}
                onClick={() => {
                  setSelectedKanji(k);
                  clearCanvas();
                }}
              >
                <span className="text-2xl font-japanese">{k}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stroke Guide Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">Hướng dẫn nét</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-gray-500">
            {showGuide ? 'BẬT' : 'TẮT'}
          </span>
          <button
            id="stroke-guide-toggle"
            onClick={() => setShowGuide(!showGuide)}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
              showGuide
                ? 'bg-sakura-500'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                showGuide ? 'translate-x-[1.375rem]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Stroke Order Display */}
      {showGuide && strokeData && (
        <div className="glass-card-solid p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">
              {strokeData.strokeCount} nét
            </span>
            <button
              id="animate-strokes-btn"
              onClick={animateStrokes}
              disabled={animating}
              className="btn-secondary text-xs disabled:opacity-50"
            >
              {animating ? `Nét ${currentStroke}/${strokeData.strokeCount}` : '▶ Minh họa'}
            </button>
          </div>

          {/* SVG stroke display */}
          <div className="bg-gray-50 dark:bg-nihon-dark rounded-xl p-2 flex items-center justify-center">
            <svg
              viewBox="0 0 109 109"
              className="w-full max-w-[200px] h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Grid */}
              <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="currentColor" strokeWidth="0.5" opacity="0.1" strokeDasharray="3 3" />
              <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="currentColor" strokeWidth="0.5" opacity="0.1" strokeDasharray="3 3" />

              {/* Strokes */}
              {strokeData.strokes.map((d, i) => {
                const isVisible = !animating || i < currentStroke;
                const isCurrent = animating && i === currentStroke - 1;

                return (
                  <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke={
                      isCurrent
                        ? '#eb5571'
                        : isVisible
                        ? (document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#333')
                        : 'transparent'
                    }
                    strokeWidth={isCurrent ? 4 : 3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isCurrent ? 'stroke-animate' : ''}
                    style={{
                      transition: 'all 0.3s ease',
                      opacity: isVisible ? 1 : 0.1,
                    }}
                  />
                );
              })}

              {/* Stroke numbers */}
              {!animating &&
                strokeData.strokes.map((d, i) => {
                  // Extract first point from path
                  const match = d.match(/M\s*([\d.]+)[,\s]+([\d.]+)/);
                  if (!match) return null;
                  const x = parseFloat(match[1]);
                  const y = parseFloat(match[2]);

                  return (
                    <text
                      key={`num-${i}`}
                      x={x - 3}
                      y={y - 3}
                      fontSize="6"
                      fill="#eb5571"
                      fontWeight="bold"
                    >
                      {i + 1}
                    </text>
                  );
                })}
            </svg>
          </div>
        </div>
      )}

      {/* Drawing Canvas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="section-title mb-0">Luyện viết</h3>
          <div className="flex items-center gap-1">
            <button
              id="undo-btn"
              onClick={undoStroke}
              className="btn-ghost text-xs py-1 px-2"
              title="Hoàn tác nét vừa viết"
            >
              ↩ Hoàn tác
            </button>
            <button
              id="clear-canvas-btn"
              onClick={clearCanvas}
              className="btn-ghost text-xs py-1 px-2"
              title="Xóa bảng viết"
            >
              🗑 Xóa
            </button>
          </div>
        </div>

        <div className="relative">
          {/* Ghost kanji for reference */}
          {selectedKanji && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span
                className="font-japanese text-gray-200 dark:text-gray-800 select-none"
                style={{ fontSize: '180px', lineHeight: 1 }}
              >
                {selectedKanji}
              </span>
            </div>
          )}

          <canvas
            ref={canvasRef}
            id="writing-canvas"
            className="writing-canvas w-full relative z-10"
            style={{ height: '280px' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Pen controls */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">Cỡ</span>
            <input
              id="pen-size"
              type="range"
              min="2"
              max="10"
              value={penSize}
              onChange={(e) => setPenSize(Number(e.target.value))}
              className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sakura-500"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400">Màu</span>
            {['#1a1a2e', '#eb5571', '#3b82f6', '#10b981'].map((color) => (
              <button
                key={color}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                  penColor === color
                    ? 'border-sakura-400 scale-110'
                    : 'border-transparent hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setPenColor(color)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
