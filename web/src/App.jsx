import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import BookDetailPage from './pages/BookDetailPage';
import ChapterReaderPage from './pages/ChapterReaderPage';
import LibraryPage from './pages/LibraryPage';
import CategoriesPage from './pages/CategoriesPage';
import AdminPage from './pages/AdminPage';
import ManageChaptersPage from './pages/ManageChaptersPage';
import LoginPage from './pages/LoginPage';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes with navbar */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/book/:id" element={<BookDetailPage />} />
                  <Route path="/book/:id/chapter/:chapterNumber" element={<ChapterReaderPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                </Routes>
              </>
            }
          />

          {/* Admin login (no navbar) */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Protected admin routes (with navbar) */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <Navbar />
                <Routes>
                  <Route path="/" element={<AdminPage />} />
                  <Route path="/book/:id/chapters" element={<ManageChaptersPage />} />
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
