const express = require('express');
const router = express.Router();
const { query, get, run } = require('../database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================

// GET all books
router.get('/', async (req, res) => {
  try {
    const books = await query(`
      SELECT b.*, 
             COUNT(c.id) as totalChapters
      FROM books b
      LEFT JOIN chapters c ON b.id = c.bookId
      GROUP BY b.id
      ORDER BY b.createdAt DESC
    `);
    
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// GET book by ID with chapters
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get book
    const book = await get('SELECT * FROM books WHERE id = ?', [id]);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Get chapters
    const chapters = await query(
      'SELECT * FROM chapters WHERE bookId = ? ORDER BY chapterNumber',
      [id]
    );
    
    book.chapters = chapters;
    book.totalChapters = chapters.length;
    
    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// GET books by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const books = await query(`
      SELECT b.*, 
             COUNT(c.id) as totalChapters
      FROM books b
      LEFT JOIN chapters c ON b.id = c.bookId
      WHERE b.category = ?
      GROUP BY b.id
      ORDER BY b.title
    `, [category]);
    
    res.json(books);
  } catch (error) {
    console.error('Error fetching books by category:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// ============================================
// PROTECTED ROUTES (Require admin auth)
// ============================================

// POST create new book (PROTECTED)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, author, description, coverImage, category } = req.body;
    
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }
    
    const result = await run(`
      INSERT INTO books (title, author, description, coverImage, category)
      VALUES (?, ?, ?, ?, ?)
    `, [title, author, description || '', coverImage || '', category || '']);
    
    const newBook = await get('SELECT * FROM books WHERE id = ?', [result.id]);
    
    res.status(201).json(newBook);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

// PUT update book (PROTECTED)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, description, coverImage, category } = req.body;
    
    // Check if book exists
    const existingBook = await get('SELECT * FROM books WHERE id = ?', [id]);
    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    await run(`
      UPDATE books 
      SET title = ?, 
          author = ?, 
          description = ?, 
          coverImage = ?, 
          category = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title || existingBook.title,
      author || existingBook.author,
      description !== undefined ? description : existingBook.description,
      coverImage !== undefined ? coverImage : existingBook.coverImage,
      category !== undefined ? category : existingBook.category,
      id
    ]);
    
    const updatedBook = await get('SELECT * FROM books WHERE id = ?', [id]);
    
    res.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// DELETE book (PROTECTED)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if book exists
    const book = await get('SELECT * FROM books WHERE id = ?', [id]);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Delete PDF file if exists
    if (book.pdfPath) {
      try {
        const fs = require('fs').promises;
        await fs.unlink(book.pdfPath);
        console.log(`Deleted book PDF: ${book.pdfPath}`);
      } catch (err) {
        console.error('Error deleting book PDF:', err);
      }
    }
    
    // Delete book (cascades to chapters, favorites, progress)
    await run('DELETE FROM books WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Book deleted successfully',
      deletedBook: book 
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

module.exports = router;
