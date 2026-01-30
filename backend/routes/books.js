const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');

// GET all books
router.get('/', async (req, res) => {
  try {
    const books = await dbHelpers.query(`
      SELECT b.*, 
        (SELECT COUNT(*) FROM favorites WHERE bookId = b.id) as favoriteCount
      FROM books b
      ORDER BY b.createdAt DESC
    `);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await dbHelpers.get(
      'SELECT * FROM books WHERE id = ?',
      [req.params.id]
    );
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Get chapters for this book
    const chapters = await dbHelpers.query(
      'SELECT * FROM chapters WHERE bookId = ? ORDER BY chapterNumber',
      [req.params.id]
    );

    res.json({ ...book, chapters });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new book
router.post('/', async (req, res) => {
  try {
    const { title, author, description, coverImage, category } = req.body;
    
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    const result = await dbHelpers.run(
      'INSERT INTO books (title, author, description, coverImage, category) VALUES (?, ?, ?, ?, ?)',
      [title, author, description, coverImage, category]
    );

    const newBook = await dbHelpers.get(
      'SELECT * FROM books WHERE id = ?',
      [result.id]
    );

    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update book
router.put('/:id', async (req, res) => {
  try {
    const { title, author, description, coverImage, category, totalChapters } = req.body;
    
    await dbHelpers.run(
      `UPDATE books 
       SET title = ?, author = ?, description = ?, coverImage = ?, category = ?, totalChapters = ?
       WHERE id = ?`,
      [title, author, description, coverImage, category, totalChapters, req.params.id]
    );

    const updatedBook = await dbHelpers.get(
      'SELECT * FROM books WHERE id = ?',
      [req.params.id]
    );

    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE book
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbHelpers.run(
      'DELETE FROM books WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET books by category
router.get('/category/:category', async (req, res) => {
  try {
    const books = await dbHelpers.query(
      'SELECT * FROM books WHERE category = ? ORDER BY createdAt DESC',
      [req.params.category]
    );
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
