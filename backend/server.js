const express = require('express');
const cors = require('cors');
const path = require('path');
const uploadRoutes = require('./routes/upload');
const dictionaryRoutes = require('./routes/dictionary');
const sentenceRoutes = require('./routes/sentences');
const kanjiRoutes = require('./routes/kanji');
const { initTokenizer } = require('./utils/textProcessor');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Cho phép tất cả các domain (kể cả Vercel) gọi API
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/dictionary', dictionaryRoutes);
app.use('/api/sentences', sentenceRoutes);
app.use('/api/kanji', kanjiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nihongo Learn API is running' });
});

// Initialize tokenizer then start server
initTokenizer()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🎌 Nihongo Learn API running on http://localhost:${PORT}`);
      console.log(`📚 Japanese tokenizer initialized successfully\n`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize tokenizer:', err);
    process.exit(1);
  });
