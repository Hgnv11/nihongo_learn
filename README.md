# 🎌 Nihongo Learn — Japanese Vocabulary & Kanji Writing Practice

A complete web application for learning Japanese vocabulary and practicing Kanji writing. Upload documents or paste Japanese text, click on words to see definitions, kanji breakdowns, example sentences, and practice writing kanji with stroke guides.

## ✨ Features

### Core Features
- **📁 Document Import** — Upload TXT, PDF, or DOCX files containing Japanese text
- **✏️ Text Paste** — Directly paste Japanese text for analysis
- **🔍 Interactive Text Viewer** — Click any word to see its details with furigana readings
- **📖 Word Analysis** — Definitions from Jisho, part of speech, JLPT level
- **漢 Kanji Breakdown** — ON/KUN readings, meanings, grade, stroke count
- **✍️ Writing Practice** — HTML5 Canvas for handwriting with pen controls
- **📊 Stroke Guide** — KanjiVG stroke order with animation
- **💬 Example Sentences** — From Tatoeba API with translations
- **🌙 Dark/Light Mode** — Toggle with system preference detection

### Extra Features
- **★ Bookmarks** — Save words for later review
- **⏱ Learning History** — Track viewed words
- **🔄 Spaced Repetition** — SM-2 algorithm for review scheduling

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Styling | TailwindCSS 3 |
| Backend | Node.js + Express |
| Tokenizer | kuromoji.js |
| File Processing | pdf-parse, mammoth |
| APIs | Jisho, Tatoeba, KanjiVG, kanjiapi.dev |

## 📦 Project Structure

```
├── backend/
│   ├── server.js              # Express server entry
│   ├── routes/
│   │   ├── upload.js          # File upload & text processing
│   │   ├── dictionary.js      # Jisho API proxy
│   │   ├── sentences.js       # Tatoeba API proxy
│   │   └── kanji.js           # KanjiVG stroke data
│   └── utils/
│       └── textProcessor.js   # kuromoji tokenizer
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app with split layout
│   │   ├── index.css          # TailwindCSS + custom styles
│   │   ├── components/
│   │   │   ├── Header.jsx     # App header + theme toggle
│   │   │   ├── FileUpload.jsx # File upload / text paste
│   │   │   ├── TextViewer.jsx # Interactive tokenized text
│   │   │   ├── WordPanel.jsx  # Word analysis panel
│   │   │   ├── KanjiWriter.jsx# Writing canvas + stroke guide
│   │   │   ├── ExampleSentences.jsx
│   │   │   └── Sidebar.jsx    # Bookmarks, history, SRS
│   │   ├── context/
│   │   │   └── AppContext.jsx # Global state management
│   │   ├── hooks/
│   │   │   └── useTheme.js   # Dark/light mode hook
│   │   └── services/
│   │       └── api.js        # API client (axios)
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`. It will initialize the kuromoji tokenizer on startup.

### 4. Start the Frontend Dev Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000` with API proxy to the backend.

### 5. Open in Browser

Navigate to `http://localhost:3000`

## 📝 Usage

1. **Upload or paste** Japanese text
2. **Click any word** in the text viewer
3. **Browse tabs** in the analysis panel:
   - **Info** — Definitions, readings, JLPT level
   - **Kanji** — Character breakdown with readings
   - **Write** — Practice writing on canvas
   - **Examples** — Example sentences
4. **Bookmark** words with the ★ button
5. **Add to SRS** with the 🔄 button for spaced repetition
6. **Toggle dark mode** with the switch in the header

## 🔌 APIs Used

| API | Purpose |
|-----|---------|
| [Jisho API](https://jisho.org/api) | Word definitions and readings |
| [kanjiapi.dev](https://kanjiapi.dev) | Kanji details (readings, grade, JLPT) |
| [Tatoeba API](https://tatoeba.org) | Example sentences with translations |
| [KanjiVG](https://github.com/KanjiVG/kanjivg) | Stroke order SVG data |

## 📄 License

MIT
