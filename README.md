# 🎌 Nihongo Learn — Japanese Vocabulary & Kanji Learning App

A full-stack, comprehensive web application for learning Japanese vocabulary, grammar, and Kanji. 
Easily upload documents or paste Japanese text, click on words to reveal definitions, kanji breakdowns, example sentences, and practice writing kanji with interactive stroke guides.

## ✨ Key Features

### 🌟 New Updates
- **🔐 Authentication** — Password-protected entry (`hoangfpt`).
- **🇻🇳 Vietnamese Localization** — UI labels, tooltips, and grammar tags (from Jisho API) are translated to Vietnamese.
- **↔️ Resizable Layout** — Draggable divider between the text viewer and word details panel.
- **⚡ Client-Side Caching** — Lightning-fast lookups by caching previously clicked words in memory.
- **📚 Enhanced Furigana** — Hiragana readings automatically generated for Kanji in example sentences.
- **🔽 Expandable Panels** — Smooth animations for toggling reading blocks.

### Core Features
- **📁 Document Import** — Upload TXT, PDF, or DOCX files containing Japanese text.
- **✏️ Text Paste** — Directly paste Japanese text for analysis.
- **🔍 Interactive Text Viewer** — Kuromoji-tokenized text; click any word to see details.
- **📖 Word Analysis** — Definitions from Jisho, part of speech, JLPT levels.
- **漢 Kanji Breakdown** — ON/KUN readings, meanings, grade, stroke count.
- **✍️ Writing Practice** — HTML5 Canvas for handwriting with pen controls.
- **📊 Stroke Guide** — KanjiVG stroke order with animation.
- **💬 Example Sentences** — From Tatoeba API with translations.
- **🌙 Dark/Light Mode** — Beautiful "Sakura" dark/light themes.

### Extra Features
- **★ Bookmarks** — Save words for later review.
- **⏱ Learning History** — Track viewed words.
- **🔄 Spaced Repetition** — SM-2 algorithm for review scheduling.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite |
| **Styling** | TailwindCSS 3 |
| **Backend** | Node.js + Express |
| **NLP Tokenizer**| kuromoji.js |
| **File Processing**| pdf-parse, mammoth |
| **APIs** | Jisho, Tatoeba, KanjiVG, kanjiapi.dev |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ installed
- Git

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*The backend runs on `http://localhost:5000` and initializes the Kuromoji tokenizer.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend runs on `http://localhost:3000`.*

**Access the app:** Open `http://localhost:3000` (Password: `hoangfpt`).

---

## 🌐 Deployment Guide (Production)

The repository contains configuration files for one-click deployments.

### Backend (Render)
1. Go to [Render](https://render.com/).
2. Create a **New Blueprint** and connect this GitHub repository.
3. Render will automatically read `render.yaml` and deploy the Node.js API.
4. Copy your backend URL (e.g., `https://nihongo-learn-api.onrender.com`).

### Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import this GitHub repository.
3. Set **Root Directory** to `frontend`.
4. In **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g., `https://nihongo-learn-api.onrender.com/api`).
5. Deploy! Vercel will use the `vercel.json` file for routing SPA logic.

---

## 🔌 APIs Used

| API | Purpose |
|-----|---------|
| [Jisho API](https://jisho.org/api) | Word definitions and readings |
| [kanjiapi.dev](https://kanjiapi.dev) | Kanji details (readings, grade, JLPT) |
| [Tatoeba API](https://tatoeba.org) | Example sentences with translations |
| [KanjiVG](https://github.com/KanjiVG/kanjivg) | Stroke order SVG data |

## 📄 License
MIT
