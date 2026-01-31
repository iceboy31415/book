const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const { query, get, run } = require('../database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// ============================================
// MULTER CONFIGURATION
// ============================================

// Storage for book PDFs
const bookStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/pdfs/books');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('Error creating upload directory:', err);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, 'book-' + name + '-' + uniqueSuffix + ext);
  }
});

// Storage for chapter PDFs
const chapterStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/pdfs/chapters');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('Error creating upload directory:', err);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, 'chapter-' + name + '-' + uniqueSuffix + ext);
  }
});

// File filter - only PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// Multer uploads
const uploadBook = multer({
  storage: bookStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

const uploadChapter = multer({
  storage: chapterStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max for chapters
});

// ============================================
// BOOK PDF UPLOAD (PROTECTED)
// ============================================

router.post('/pdf', verifyToken, isAdmin, uploadBook.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { title, author, description, category } = req.body;

    if (!title || !author) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Title and author are required' });
    }

    // Extract PDF metadata
    const pdfBuffer = await fs.readFile(req.file.path);
    let pageCount = 0;

    try {
      const pdfData = await pdfParse(pdfBuffer);
      pageCount = pdfData.numpages;
      console.log(`PDF parsed: ${pageCount} pages`);
    } catch (parseError) {
      console.error('PDF parse error:', parseError);
    }

    // Save book to database
    const result = await run(`
      INSERT INTO books (
        title, 
        author, 
        description, 
        category,
        pdfPath,
        pdfFileName,
        pdfSize,
        pageCount
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      author,
      description || '',
      category || 'Uncategorized',
      req.file.path,
      req.file.originalname,
      req.file.size,
      pageCount
    ]);

    const newBook = await get('SELECT * FROM books WHERE id = ?', [result.id]);

    res.status(201).json({
      message: 'Book PDF uploaded successfully',
      book: newBook,
    });

  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({ error: 'Failed to upload PDF' });
  }
});

// ============================================
// CHAPTER PDF UPLOAD (PROTECTED)
// ============================================

router.post('/chapter-pdf', verifyToken, isAdmin, uploadChapter.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { chapterId } = req.body;

    if (!chapterId) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Chapter ID is required' });
    }

    // Check if chapter exists
    const chapter = await get('SELECT * FROM chapters WHERE id = ?', [chapterId]);
    if (!chapter) {
      await fs.unlink(req.file.path);
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Delete old PDF if exists
    if (chapter.pdfPath) {
      try {
        await fs.unlink(chapter.pdfPath);
      } catch (err) {
        console.error('Error deleting old PDF:', err);
      }
    }

    // Update chapter with PDF info
    await run(`
      UPDATE chapters 
      SET pdfPath = ?,
          pdfFileName = ?,
          pdfSize = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      req.file.path,
      req.file.originalname,
      req.file.size,
      chapterId
    ]);

    const updatedChapter = await get('SELECT * FROM chapters WHERE id = ?', [chapterId]);

    res.status(200).json({
      message: 'Chapter PDF uploaded successfully',
      chapter: updatedChapter,
    });

  } catch (error) {
    console.error('Chapter PDF upload error:', error);
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({ error: 'Failed to upload chapter PDF' });
  }
});

// ============================================
// VIEW/DOWNLOAD BOOK PDF (PUBLIC)
// ============================================

router.get('/pdf/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await get('SELECT * FROM books WHERE id = ?', [bookId]);

    if (!book || !book.pdfPath) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    try {
      await fs.access(book.pdfPath);
    } catch (err) {
      return res.status(404).json({ error: 'PDF file not found on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${book.pdfFileName}"`);

    const fileStream = require('fs').createReadStream(book.pdfPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).json({ error: 'Failed to retrieve PDF' });
  }
});

// ============================================
// VIEW/DOWNLOAD CHAPTER PDF (PUBLIC)
// ============================================

router.get('/chapter-pdf/:chapterId', async (req, res) => {
  try {
    const { chapterId } = req.params;
    const chapter = await get('SELECT * FROM chapters WHERE id = ?', [chapterId]);

    if (!chapter || !chapter.pdfPath) {
      return res.status(404).json({ error: 'Chapter PDF not found' });
    }

    try {
      await fs.access(chapter.pdfPath);
    } catch (err) {
      return res.status(404).json({ error: 'PDF file not found on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${chapter.pdfFileName}"`);

    const fileStream = require('fs').createReadStream(chapter.pdfPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Chapter PDF download error:', error);
    res.status(500).json({ error: 'Failed to retrieve chapter PDF' });
  }
});

// ============================================
// DELETE BOOK PDF (PROTECTED)
// ============================================

router.delete('/pdf/:bookId', verifyToken, isAdmin, async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await get('SELECT * FROM books WHERE id = ?', [bookId]);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.pdfPath) {
      try {
        await fs.unlink(book.pdfPath);
      } catch (err) {
        console.error('Error deleting PDF file:', err);
      }
    }

    await run('DELETE FROM books WHERE id = ?', [bookId]);

    res.json({ message: 'Book and PDF deleted successfully' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete PDF' });
  }
});

// ============================================
// DELETE CHAPTER PDF (PROTECTED)
// ============================================

router.delete('/chapter-pdf/:chapterId', verifyToken, isAdmin, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const chapter = await get('SELECT * FROM chapters WHERE id = ?', [chapterId]);

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    if (chapter.pdfPath) {
      try {
        await fs.unlink(chapter.pdfPath);
      } catch (err) {
        console.error('Error deleting chapter PDF:', err);
      }
    }

    // Remove PDF info from chapter
    await run(`
      UPDATE chapters 
      SET pdfPath = NULL,
          pdfFileName = NULL,
          pdfSize = NULL,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [chapterId]);

    res.json({ message: 'Chapter PDF deleted successfully' });

  } catch (error) {
    console.error('Delete chapter PDF error:', error);
    res.status(500).json({ error: 'Failed to delete chapter PDF' });
  }
});

module.exports = router;
