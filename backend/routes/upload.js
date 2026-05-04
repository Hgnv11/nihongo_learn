const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { tokenizeText, containsJapanese, extractSentences } = require('../utils/textProcessor');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.txt', '.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ hỗ trợ tệp .txt, .pdf và .docx'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

/**
 * Extract text from uploaded file based on type
 */
async function extractText(filePath, ext) {
  switch (ext.toLowerCase()) {
    case '.txt': {
      return fs.readFileSync(filePath, 'utf-8');
    }
    case '.pdf': {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    }
    case '.docx': {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
    default:
      throw new Error(`Định dạng tệp không được hỗ trợ: ${ext}`);
  }
}

/**
 * POST /api/upload
 * Upload a file, extract text, detect Japanese, tokenize
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Chưa tải tệp lên' });
    }

    const ext = path.extname(req.file.originalname);
    const filePath = req.file.path;

    // Extract text
    const rawText = await extractText(filePath, ext);

    // Check for Japanese content
    if (!containsJapanese(rawText)) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        error: 'Không phát hiện văn bản tiếng Nhật trong tệp',
      });
    }

    // Tokenize
    const tokens = tokenizeText(rawText);

    // Extract sentences
    const sentences = extractSentences(rawText);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      filename: req.file.originalname,
      rawText,
      tokens,
      sentences,
      stats: {
        totalCharacters: rawText.length,
        totalTokens: tokens.length,
        japaneseTokens: tokens.filter((t) => t.isJapanese).length,
        kanjiTokens: tokens.filter((t) => t.hasKanji).length,
        sentenceCount: sentences.length,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Không thể xử lý tệp' });
  }
});

/**
 * POST /api/upload/text
 * Direct text input (paste)
 */
router.post('/text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Chưa nhập văn bản' });
    }

    if (!containsJapanese(text)) {
      return res.status(400).json({
        error: 'Không phát hiện văn bản tiếng Nhật',
      });
    }

    const tokens = tokenizeText(text);
    const sentences = extractSentences(text);

    res.json({
      success: true,
      rawText: text,
      tokens,
      sentences,
      stats: {
        totalCharacters: text.length,
        totalTokens: tokens.length,
        japaneseTokens: tokens.filter((t) => t.isJapanese).length,
        kanjiTokens: tokens.filter((t) => t.hasKanji).length,
        sentenceCount: sentences.length,
      },
    });
  } catch (error) {
    console.error('Text processing error:', error);
    res.status(500).json({ error: error.message || 'Không thể xử lý văn bản' });
  }
});

module.exports = router;
