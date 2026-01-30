const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');

// GET all chapters for a book
router.get('/book/:bookId', async (req, res) => {
  try {
    const chapters = await dbHelpers.query(
      'SELECT * FROM chapters WHERE bookId = ? ORDER BY chapterNumber',
      [req.params.bookId]
    );
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single chapter
router.get('/:id', async (req, res) => {
  try {
    const chapter = await dbHelpers.get(
      'SELECT * FROM chapters WHERE id = ?',
      [req.params.id]
    );
    
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json(chapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new chapter
router.post('/', async (req, res) => {
  try {
    const { bookId, chapterNumber, title, summary, readTimeMinutes } = req.body;
    
    if (!bookId || !chapterNumber || !title || !summary) {
      return res.status(400).json({ 
        error: 'bookId, chapterNumber, title, and summary are required' 
      });
    }

    const result = await dbHelpers.run(
      `INSERT INTO chapters (bookId, chapterNumber, title, summary, readTimeMinutes) 
       VALUES (?, ?, ?, ?, ?)`,
      [bookId, chapterNumber, title, summary, readTimeMinutes || 5]
    );

    // Update total chapters count in books table
    await dbHelpers.run(
      `UPDATE books 
       SET totalChapters = (SELECT COUNT(*) FROM chapters WHERE bookId = ?)
       WHERE id = ?`,
      [bookId, bookId]
    );

    const newChapter = await dbHelpers.get(
      'SELECT * FROM chapters WHERE id = ?',
      [result.id]
    );

    res.status(201).json(newChapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update chapter
router.put('/:id', async (req, res) => {
  try {
    const { chapterNumber, title, summary, readTimeMinutes } = req.body;
    
    await dbHelpers.run(
      `UPDATE chapters 
       SET chapterNumber = ?, title = ?, summary = ?, readTimeMinutes = ?
       WHERE id = ?`,
      [chapterNumber, title, summary, readTimeMinutes, req.params.id]
    );

    const updatedChapter = await dbHelpers.get(
      'SELECT * FROM chapters WHERE id = ?',
      [req.params.id]
    );

    res.json(updatedChapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE chapter
router.delete('/:id', async (req, res) => {
  try {
    // Get chapter to find bookId before deleting
    const chapter = await dbHelpers.get(
      'SELECT bookId FROM chapters WHERE id = ?',
      [req.params.id]
    );

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    await dbHelpers.run(
      'DELETE FROM chapters WHERE id = ?',
      [req.params.id]
    );

    // Update total chapters count in books table
    await dbHelpers.run(
      `UPDATE books 
       SET totalChapters = (SELECT COUNT(*) FROM chapters WHERE bookId = ?)
       WHERE id = ?`,
      [chapter.bookId, chapter.bookId]
    );

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
