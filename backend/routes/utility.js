const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await dbHelpers.query(
      `SELECT category, COUNT(*) as count 
       FROM books 
       WHERE category IS NOT NULL AND category != ''
       GROUP BY category 
       ORDER BY category`
    );
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET search books
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = `%${query}%`;
    
    const books = await dbHelpers.query(
      `SELECT DISTINCT b.* 
       FROM books b
       LEFT JOIN chapters c ON b.id = c.bookId
       WHERE b.title LIKE ? 
          OR b.author LIKE ? 
          OR b.description LIKE ?
          OR b.category LIKE ?
          OR c.title LIKE ?
          OR c.summary LIKE ?
       ORDER BY b.createdAt DESC`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    );

    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
