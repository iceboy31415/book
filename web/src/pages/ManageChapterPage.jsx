import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { booksAPI, chaptersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const Container = styled.div`
  max-width: 900px;
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

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  color: ${colors.primary};
  font-size: ${fontSize.md};
  font-weight: 600;
  cursor: pointer;
  background: none;
  border: none;
  padding: ${spacing.sm};

  &:hover {
    opacity: 0.7;
  }
`;

const HeaderCenter = styled.div`
  flex: 1;
  text-align: center;

  @media (max-width: 768px) {
    text-align: left;
  }
`;

const Title = styled.h1`
  font-size: ${fontSize.xl};
  font-weight: 600;
  color: ${colors.text};

  @media (max-width: 768px) {
    font-size: ${fontSize.lg};
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  background: ${colors.primary};
  color: ${colors.background};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};
  font-size: ${fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${colors.primaryDark};
  }

  svg {
    font-size: 18px;
  }
`;

const ChaptersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const ChapterItem = styled.div`
  background: ${colors.backgroundGray};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.md};
`;

const ChapterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  margin-bottom: ${spacing.md};
`;

const ChapterNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${colors.primary};
  color: ${colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
`;

const ChapterInfo = styled.div`
  flex: 1;
`;

const ChapterTitle = styled.h3`
  font-size: ${fontSize.md};
  font-weight: 500;
  color: ${colors.text};
  margin-bottom: ${spacing.xs};
`;

const ReadTime = styled.p`
  font-size: ${fontSize.xs};
  color: ${colors.textLight};
`;

const ChapterActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
`;

const ActionButton = styled.button`
  background: ${props => props.danger ? colors.error + '10' : colors.background};
  color: ${props => props.danger ? colors.error : colors.text};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};
  font-size: ${fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }

  svg {
    font-size: 14px;
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
  align-items: flex-end;
  z-index: 1000;

  @media (min-width: 768px) {
    align-items: center;
  }
`;

const ModalContent = styled.div`
  background: ${colors.background};
  border-top-left-radius: ${borderRadius.xl};
  border-top-right-radius: ${borderRadius.xl};
  padding: ${spacing.xl};
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;

  @media (min-width: 768px) {
    border-radius: ${borderRadius.lg};
  }
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
  min-height: 150px;
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

const ManageChaptersPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [formData, setFormData] = useState({
    chapterNumber: '',
    title: '',
    summary: '',
    readTimeMinutes: '5',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookResponse, chaptersResponse] = await Promise.all([
        booksAPI.getById(id),
        chaptersAPI.getByBookId(id),
      ]);
      setBook(bookResponse.data);
      setChapters(chaptersResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    const nextChapterNumber = chapters.length + 1;
    setEditingChapter(null);
    setFormData({
      chapterNumber: nextChapterNumber.toString(),
      title: '',
      summary: '',
      readTimeMinutes: '5',
    });
    setShowModal(true);
  };

  const openEditModal = (chapter) => {
    setEditingChapter(chapter);
    setFormData({
      chapterNumber: chapter.chapterNumber.toString(),
      title: chapter.title,
      summary: chapter.summary,
      readTimeMinutes: chapter.readTimeMinutes.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.summary.trim()) {
      alert('Title and summary are required');
      return;
    }

    try {
      const chapterData = {
        bookId: id,
        chapterNumber: parseInt(formData.chapterNumber),
        title: formData.title,
        summary: formData.summary,
        readTimeMinutes: parseInt(formData.readTimeMinutes) || 5,
      };

      if (editingChapter) {
        await chaptersAPI.update(editingChapter.id, chapterData);
        alert('Chapter updated successfully');
      } else {
        await chaptersAPI.create(chapterData);
        alert('Chapter created successfully');
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving chapter:', error);
      alert('Failed to save chapter');
    }
  };

  const handleDelete = async (chapterId) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      try {
        await chaptersAPI.delete(chapterId);
        alert('Chapter deleted successfully');
        loadData();
      } catch (error) {
        console.error('Error deleting chapter:', error);
        alert('Failed to delete chapter');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/admin')}>
          <FiArrowLeft /> Back
        </BackButton>
        <HeaderCenter>
          <Title>{book?.title}</Title>
        </HeaderCenter>
        <AddButton onClick={openAddModal}>
          <FiPlus /> Add
        </AddButton>
      </Header>

      {chapters.length > 0 ? (
        <ChaptersList>
          {chapters.map((chapter) => (
            <ChapterItem key={chapter.id}>
              <ChapterHeader>
                <ChapterNumber>{chapter.chapterNumber}</ChapterNumber>
                <ChapterInfo>
                  <ChapterTitle>{chapter.title}</ChapterTitle>
                  <ReadTime>{chapter.readTimeMinutes} min read</ReadTime>
                </ChapterInfo>
              </ChapterHeader>
              <ChapterActions>
                <ActionButton onClick={() => openEditModal(chapter)}>
                  <FiEdit2 />
                  Edit
                </ActionButton>
                <ActionButton danger onClick={() => handleDelete(chapter.id)}>
                  <FiTrash2 />
                  Delete
                </ActionButton>
              </ChapterActions>
            </ChapterItem>
          ))}
        </ChaptersList>
      ) : (
        <EmptyState>
          <EmptyText>No chapters yet</EmptyText>
          <EmptySubtext>Click "+ Add" to create chapters</EmptySubtext>
        </EmptyState>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingChapter ? 'Edit Chapter' : 'Add Chapter'}</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Chapter Number *</Label>
                <Input
                  type="number"
                  value={formData.chapterNumber}
                  onChange={(e) => setFormData({ ...formData, chapterNumber: e.target.value })}
                  placeholder="1"
                  required
                  min="1"
                />
              </FormGroup>

              <FormGroup>
                <Label>Title *</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter chapter title"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Summary *</Label>
                <TextArea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Enter chapter summary/blink content"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Read Time (minutes)</Label>
                <Input
                  type="number"
                  value={formData.readTimeMinutes}
                  onChange={(e) => setFormData({ ...formData, readTimeMinutes: e.target.value })}
                  placeholder="5"
                  min="1"
                />
              </FormGroup>

              <SubmitButton type="submit">
                {editingChapter ? 'Update Chapter' : 'Create Chapter'}
              </SubmitButton>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default ManageChaptersPage;
