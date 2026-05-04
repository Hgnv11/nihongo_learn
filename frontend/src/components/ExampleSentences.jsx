export default function ExampleSentences({ sentences }) {
  if (!sentences || sentences.length === 0) {
    return (
      <div className="text-center py-8 animate-in">
        <p className="text-gray-400 text-sm">Không tìm thấy câu ví dụ.</p>
        <p className="text-gray-300 dark:text-gray-600 text-xs mt-2">
          Thử chọn một từ khác để xem ví dụ
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in">
      <h3 className="section-title">Câu ví dụ</h3>

      {sentences.map((sentence, i) => (
        <div
          key={sentence.id || i}
          className="glass-card-solid p-4 hover:shadow-md transition-shadow"
        >
          {/* Japanese sentence */}
          <p className="text-base font-japanese text-gray-800 dark:text-gray-200 mb-2 leading-relaxed">
            {sentence.text}
          </p>

          {/* Translation */}
          {sentence.translation && (
            <p className="text-sm text-gray-500 dark:text-gray-400 pl-3 border-l-2 border-gray-200 dark:border-nihon-border">
              {sentence.translation}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-2">
            {sentence.isFallback && (
              <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-100 dark:bg-nihon-dark rounded">
                Tạo tự động
              </span>
            )}
            {sentence.translationLang && !sentence.isFallback && (
              <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-100 dark:bg-nihon-dark rounded">
                Tatoeba
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
