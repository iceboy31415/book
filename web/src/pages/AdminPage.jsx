import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { booksAPI, chaptersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';
import { FiPlus, FiEdit2, FiTrash2, FiList } from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing.lg} ${spacing.md};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.xl};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${spacing.md};
  }
`;

const Title = styled.h1`
  font-size: ${fontSize.xxl};
  font-weight: bold;
  color: ${colors.text};

  @media (max-width: 768px) {
    font-size: ${fontSize.xl};
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  background: ${colors.primary};
  color: ${colors.background};
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.md};
  font-size: ${fontSize.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${colors.primaryDark};
  }

  svg {
    font-size: 20px;
  }
`;

const BooksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const BookItem = styled.div`
  background: ${colors.background};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.md};
  box-shadow: ${shadows.sm};
`;

const BookHeader = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-bottom: ${spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const BookCover = styled.img`
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: ${borderRadius.md};
  background: ${colors.backgroundGray};
  flex-shrink: 0;
`;

const PlaceholderCover = styled.div`
  width: 80px;
  height: 120px;
  background: ${colors.backgroundGray};
  border-radius: ${borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
`;

const BookInfo = styled.div`
  flex: 1;
`;

const BookTitle = styled.h3`
  font-size: ${fontSize.lg};
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: ${spacing.xs};
`;

const BookAuthor = styled.p`
  font-size: ${fontSize.sm};
  color: ${colors.textSecondary};
  margin-bottom: ${spacing.sm};
`;

const BookMeta = styled.div`
  display: flex;
  gap: ${spacing.md};
  font-size: ${fontSize.xs};
  color: ${colors.textLight};
`;

const BookActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing.sm};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  background: ${props => props.danger ? colors.error + '10' : colors.backgroundGray};
  color: ${props => props.danger ? colors.error : colors.text};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};
  font-size: ${fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }

  svg {
    font-size: 16px;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${colors.overlay};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: ${spacing.md};
`;

const ModalContent = styled.div`
  background: ${colors.background};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xl};
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.lg};
`;

const ModalTitle = styled.h2`
  font-size: ${fontSize.xl};
  font-weight: 600;
  color: ${colors.text};
`;

const CloseButton = styled.button`
  font-size: 32px;
  color: ${colors.textLight};
  cursor: pointer;
  background: none;
  border: none;
  line-height: 1;

  &:hover {
    color: ${colors.text};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const Label = styled.label`
  font-size: ${fontSize.md};
  font-weight: 600;
  color: ${colors.text};
`;

const Input = styled.input`
  padding: ${spacing.md};
  font-size: ${fontSize.md};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  outline: none;

  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${colors.primary}20;
  }
`;

const TextArea = styled.textarea`
  padding: ${spacing.md};
  font-size: ${fontSize.md};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  outline: none;
  min-height: 100px;
  font-family: inherit;
  resize: vertical;

  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${colors.primary}20;
  }
`;

const SubmitButton = styled.button`
  background: ${colors.primary};
  color: ${colors.background};
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.md};
  font-size: ${fontSize.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: ${spacing.md};

  &:hover {
    background: ${colors.primaryDark};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing.xxl};
`;

const EmptyText = styled.p`
  font-size: ${fontSize.lg};
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: ${spacing.sm};
`;

const EmptySubtext = styled.p`
  font-size: ${fontSize.md};
  color: ${colors.textSecondary};
`;

const AdminPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    coverImage: '',
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const response = await booksAPI.getAll();
      setBooks(response.data);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      description: '',
      category: '',
      coverImage: '',
    });
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      category: book.category || '',
      coverImage: book.coverImage || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.author.trim()) {
      alert('Title and author are required');
      return;
    }

    try {
      if (editingBook) {
        await booksAPI.update(editingBook.id, formData);
        alert('Book updated successfully');
      } else {
        await booksAPI.create(formData);
        alert('Book created successfully');
      }
      setShowModal(false);
      loadBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Failed to save book');
    }
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book? This will also delete all chapters.')) {
      try {
        await booksAPI.delete(bookId);
        alert('Book deleted successfully');
        loadBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Failed to delete book');
      }
    }
  };

  const handleManageChapters = (bookId) => {
    navigate(`/admin/book/${bookId}/chapters`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <Header>
        <Title>Admin Panel</Title>
        <AddButton onClick={openAddModal}>
          <FiPlus />
          Add Book
        </AddButton>
      </Header>

      {books.length > 0 ? (
        <BooksList>
          {books.map((book) => (
            <BookItem key={book.id}>
              <BookHeader>
                {book.coverImage ? (
                  <BookCover src={book.coverImage} alt={book.title} />
                ) : (
                  <PlaceholderCover>📚</PlaceholderCover>
                )}

                <BookInfo>
                  <BookTitle>{book.title}</BookTitle>
                  <BookAuthor>{book.author}</BookAuthor>
                  <BookMeta>
                    {book.category && <span>{book.category}</span>}
                    <span>{book.totalChapters || 0} chapters</span>
                  </BookMeta>
                </BookInfo>
              </BookHeader>

              <BookActions>
                <ActionButton onClick={() => openEditModal(book)}>
                  <FiEdit2 />
                  Edit
                </ActionButton>
                <ActionButton onClick={() => handleManageChapters(book.id)}>
                  <FiList />
                  Chapters
                </ActionButton>
                <ActionButton danger onClick={() => handleDelete(book.id)}>
                  <FiTrash2 />
                  Delete
                </ActionButton>
              </BookActions>
            </BookItem>
          ))}
        </BooksList>
      ) : (
        <EmptyState>
          <EmptyText>No books yet</EmptyText>
          <EmptySubtext>Click "Add Book" to create your first book</EmptySubtext>
        </EmptyState>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingBook ? 'Edit Book' : 'Add Book'}</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Title *</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter book title"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Author *</Label>
                <Input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Enter author name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Category</Label>
                <Input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Self-Help, Business, Science"
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter book description"
                />
              </FormGroup>

              <FormGroup>
                <Label>Cover Image URL</Label>
                <Input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="Enter image URL"
                />
              </FormGroup>

              <SubmitButton type="submit">
                {editingBook ? 'Update Book' : 'Create Book'}
              </SubmitButton>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default AdminPage;
