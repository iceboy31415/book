const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');

// GET all favorites for a device
router.get('/:deviceId', async (req, res) => {
  try {
    const favorites = await dbHelpers.query(
      `SELECT f.*, b.* 
       FROM favorites f
       JOIN books b ON f.bookId = b.id
       WHERE f.deviceId = ?
       ORDER BY f.savedAt DESC`,
      [req.params.deviceId]
    );
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add to favorites
router.post('/', async (req, res) => {
  try {
    const { deviceId, bookId } = req.body;
    
    if (!deviceId || !bookId) {
      return res.status(400).json({ error: 'deviceId and bookId are required' });
    }

    // Check if already favorited
    const existing = await dbHelpers.get(
      'SELECT * FROM favorites WHERE deviceId = ? AND bookId = ?',
      [deviceId, bookId]
    );

    if (existing) {
      return res.status(409).json({ error: 'Book already in favorites' });
    }

    const result = await dbHelpers.run(
      'INSERT INTO favorites (deviceId, bookId) VALUES (?, ?)',
      [deviceId, bookId]
    );

    const newFavorite = await dbHelpers.get(
      `SELECT f.*, b.* 
       FROM favorites f
       JOIN books b ON f.bookId = b.id
       WHERE f.id = ?`,
      [result.id]
    );

    res.status(201).json(newFavorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE remove from favorites
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbHelpers.run(
      'DELETE FROM favorites WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE remove by deviceId and bookId
router.delete('/:deviceId/:bookId', async (req, res) => {
  try {
    const result = await dbHelpers.run(
      'DELETE FROM favorites WHERE deviceId = ? AND bookId = ?',
      [req.params.deviceId, req.params.bookId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET check if book is favorited
router.get('/:deviceId/:bookId', async (req, res) => {
  try {
    const favorite = await dbHelpers.get(
      'SELECT * FROM favorites WHERE deviceId = ? AND bookId = ?',
      [req.params.deviceId, req.params.bookId]
    );
    
    res.json({ isFavorited: !!favorite, favorite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
