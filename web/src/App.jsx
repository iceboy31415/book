import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BookDetailPage from './pages/BookDetailPage';
import ChapterReaderPage from './pages/ChapterReaderPage';
import LibraryPage from './pages/LibraryPage';
import CategoriesPage from './pages/CategoriesPage';
import AdminPage from './pages/AdminPage';
import ManageChaptersPage from './pages/ManageChaptersPage';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book/:id" element={<BookDetailPage />} />
          <Route path="/book/:id/chapter/:chapterNumber" element={<ChapterReaderPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/book/:id/chapters" element={<ManageChaptersPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
