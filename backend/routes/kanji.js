const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

// Cache for KanjiVG SVG data
const svgCache = new Map();

/**
 * GET /api/kanji/svg/:kanji
 * Fetch KanjiVG stroke order SVG for a kanji character
 */
router.get('/svg/:kanji', async (req, res) => {
  try {
    const { kanji } = req.params;
    const codePoint = kanji.codePointAt(0).toString(16).padStart(5, '0');

    if (svgCache.has(codePoint)) {
      res.set('Content-Type', 'image/svg+xml');
      return res.send(svgCache.get(codePoint));
    }

    // Fetch from KanjiVG repository
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${codePoint}.svg`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(404).json({ error: 'Không tìm thấy dữ liệu nét cho kanji này' });
    }

    const svgData = await response.text();
    svgCache.set(codePoint, svgData);

    res.set('Content-Type', 'image/svg+xml');
    res.send(svgData);
  } catch (error) {
    console.error('KanjiVG fetch error:', error);
    res.status(500).json({ error: 'Không thể tải dữ liệu nét' });
  }
});

/**
 * GET /api/kanji/strokes/:kanji
 * Get parsed stroke path data for animation
 */
router.get('/strokes/:kanji', async (req, res) => {
  try {
    const { kanji } = req.params;
    const codePoint = kanji.codePointAt(0).toString(16).padStart(5, '0');

    let svgData;

    if (svgCache.has(codePoint)) {
      svgData = svgCache.get(codePoint);
    } else {
      const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${codePoint}.svg`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(404).json({ error: 'Không tìm thấy dữ liệu nét' });
      }

      svgData = await response.text();
      svgCache.set(codePoint, svgData);
    }

    // Parse SVG to extract stroke paths
    const pathRegex = /<path[^>]*\bd="([^"]+)"[^>]*>/g;
    const strokes = [];
    let match;

    while ((match = pathRegex.exec(svgData)) !== null) {
      strokes.push(match[1]);
    }

    res.json({
      success: true,
      kanji,
      codePoint,
      strokeCount: strokes.length,
      strokes,
      svg: svgData,
    });
  } catch (error) {
    console.error('Stroke parsing error:', error);
    res.status(500).json({ error: 'Không thể phân tích dữ liệu nét' });
  }
});

module.exports = router;
