const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');

// GET progress for a specific book and device
router.get('/:deviceId/:bookId', async (req, res) => {
  try {
    const progress = await dbHelpers.get(
      `SELECT p.*, b.totalChapters 
       FROM reading_progress p
       JOIN books b ON p.bookId = b.id
       WHERE p.deviceId = ? AND p.bookId = ?`,
      [req.params.deviceId, req.params.bookId]
    );
    
    if (progress && progress.chaptersRead) {
      progress.chaptersRead = JSON.parse(progress.chaptersRead);
    }

    res.json(progress || { chaptersRead: [], percentComplete: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all progress for a device
router.get('/:deviceId', async (req, res) => {
  try {
    const progressList = await dbHelpers.query(
      `SELECT p.*, b.title, b.author, b.coverImage, b.totalChapters
       FROM reading_progress p
       JOIN books b ON p.bookId = b.id
       WHERE p.deviceId = ?
       ORDER BY p.lastUpdated DESC`,
      [req.params.deviceId]
    );
    
    // Parse chaptersRead JSON for each progress entry
    progressList.forEach(progress => {
      if (progress.chaptersRead) {
        progress.chaptersRead = JSON.parse(progress.chaptersRead);
      }
    });

    res.json(progressList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create or update progress
router.post('/', async (req, res) => {
  try {
    const { deviceId, bookId, chaptersRead, lastReadChapter } = req.body;
    
    if (!deviceId || !bookId) {
      return res.status(400).json({ error: 'deviceId and bookId are required' });
    }

    // Get book's total chapters
    const book = await dbHelpers.get(
      'SELECT totalChapters FROM books WHERE id = ?',
      [bookId]
    );

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Calculate percent complete
    const chaptersReadArray = Array.isArray(chaptersRead) ? chaptersRead : [];
    const percentComplete = book.totalChapters > 0 
      ? (chaptersReadArray.length / book.totalChapters) * 100 
      : 0;

    const completedAt = percentComplete === 100 ? new Date().toISOString() : null;

    // Check if progress already exists
    const existing = await dbHelpers.get(
      'SELECT id FROM reading_progress WHERE deviceId = ? AND bookId = ?',
      [deviceId, bookId]
    );

    if (existing) {
      // Update existing progress
      await dbHelpers.run(
        `UPDATE reading_progress 
         SET chaptersRead = ?, lastReadChapter = ?, percentComplete = ?, 
             completedAt = ?, lastUpdated = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [JSON.stringify(chaptersReadArray), lastReadChapter, percentComplete, completedAt, existing.id]
      );

      const updated = await dbHelpers.get(
        'SELECT * FROM reading_progress WHERE id = ?',
        [existing.id]
      );
      
      if (updated.chaptersRead) {
        updated.chaptersRead = JSON.parse(updated.chaptersRead);
      }

      res.json(updated);
    } else {
      // Create new progress
      const result = await dbHelpers.run(
        `INSERT INTO reading_progress (deviceId, bookId, chaptersRead, lastReadChapter, percentComplete, completedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [deviceId, bookId, JSON.stringify(chaptersReadArray), lastReadChapter, percentComplete, completedAt]
      );

      const newProgress = await dbHelpers.get(
        'SELECT * FROM reading_progress WHERE id = ?',
        [result.id]
      );
      
      if (newProgress.chaptersRead) {
        newProgress.chaptersRead = JSON.parse(newProgress.chaptersRead);
      }

      res.status(201).json(newProgress);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update progress
router.put('/:id', async (req, res) => {
  try {
    const { chaptersRead, lastReadChapter, percentComplete, completedAt } = req.body;
    
    await dbHelpers.run(
      `UPDATE reading_progress 
       SET chaptersRead = ?, lastReadChapter = ?, percentComplete = ?, 
           completedAt = ?, lastUpdated = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [JSON.stringify(chaptersRead), lastReadChapter, percentComplete, completedAt, req.params.id]
    );

    const updated = await dbHelpers.get(
      'SELECT * FROM reading_progress WHERE id = ?',
      [req.params.id]
    );
    
    if (updated && updated.chaptersRead) {
      updated.chaptersRead = JSON.parse(updated.chaptersRead);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE progress
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbHelpers.run(
      'DELETE FROM reading_progress WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    res.json({ message: 'Progress deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
