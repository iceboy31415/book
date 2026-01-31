import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { booksAPI, chaptersAPI, uploadAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiUpload, FiFile, FiEye } from 'react-icons/fi';

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
  border: none;

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

const ChapterMeta = styled.div`
  display: flex;
  gap: ${spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const ReadTime = styled.p`
  font-size: ${fontSize.xs};
  color: ${colors.textLight};
`;

const PDFBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  background: ${colors.success}20;
  color: ${colors.success};
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.sm};
  font-size: ${fontSize.xs};
  font-weight: 600;

  svg {
    font-size: 12px;
  }
`;

const ChapterActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${props => props.danger ? colors.error + '10' : props.view ? colors.primary + '10' : colors.background};
  color: ${props => props.danger ? colors.error : props.view ? colors.primary : colors.text};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};
  font-size: ${fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  transition: all 0.2s;
  border: none;

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

const FileInputWrapper = styled.div`
  border: 2px dashed ${colors.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.primary};
    background: ${colors.primary}10;
  }

  input[type="file"] {
    display: none;
  }
`;

const FileInputLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.sm};
  cursor: pointer;
  color: ${colors.textSecondary};

  svg {
    font-size: 32px;
    color: ${colors.primary};
  }
`;

const FileName = styled.p`
  margin-top: ${spacing.sm};
  font-size: ${fontSize.sm};
  color: ${colors.primary};
  font-weight: 600;
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
  border: none;

  &:hover {
    background: ${colors.primaryDark};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${colors.backgroundGray};
  border-radius: ${borderRadius.sm};
  overflow: hidden;
  margin-top: ${spacing.md};
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${colors.primary};
  width: ${props => props.progress}%;
  transition: width 0.3s;
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    chapterNumber: '',
    title: '',
    summary: '',
    readTimeMinutes: '5',
    pdfFile: null,
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
      alert('Failed to load chapters');
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
      pdfFile: null,
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
      pdfFile: null,
    });
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, pdfFile: file });
    } else {
      alert('Please select a valid PDF file');
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.summary.trim()) {
      alert('Title and summary are required');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const chapterData = {
        bookId: id,
        chapterNumber: parseInt(formData.chapterNumber),
        title: formData.title,
        summary: formData.summary,
        readTimeMinutes: parseInt(formData.readTimeMinutes) || 5,
      };

      let chapterId;

      if (editingChapter) {
        await chaptersAPI.update(editingChapter.id, chapterData);
        chapterId = editingChapter.id;
        setUploadProgress(30);
      } else {
        const result = await chaptersAPI.create(chapterData);
        chapterId = result.data.id;
        setUploadProgress(30);
      }

      // Upload PDF if selected
      if (formData.pdfFile && chapterId) {
        const formDataToSend = new FormData();
        formDataToSend.append('pdf', formData.pdfFile);
        formDataToSend.append('chapterId', chapterId);

        setUploadProgress(50);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        await uploadAPI.uploadChapterPDF(formDataToSend);

        clearInterval(progressInterval);
        setUploadProgress(100);
      } else {
        setUploadProgress(100);
      }

      setTimeout(() => {
        alert(editingChapter ? 'Chapter updated successfully' : 'Chapter created successfully');
        setShowModal(false);
        setIsUploading(false);
        loadData();
      }, 500);

    } catch (error) {
      console.error('Error saving chapter:', error);
      alert(error.response?.data?.error || 'Failed to save chapter');
      setIsUploading(false);
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

  const handleViewPDF = (chapterId) => {
    const pdfUrl = uploadAPI.getChapterPDFUrl(chapterId);
    window.open(pdfUrl, '_blank');
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
                  <ChapterMeta>
                    <ReadTime>{chapter.readTimeMinutes} min read</ReadTime>
                    {chapter.pdfPath && (
                      <PDFBadge>
                        <FiFile /> PDF
                      </PDFBadge>
                    )}
                  </ChapterMeta>
                </ChapterInfo>
              </ChapterHeader>
              <ChapterActions>
                <ActionButton onClick={() => openEditModal(chapter)}>
                  <FiEdit2 />
                  Edit
                </ActionButton>
                {chapter.pdfPath && (
                  <ActionButton view onClick={() => handleViewPDF(chapter.id)}>
                    <FiEye />
                    View PDF
                  </ActionButton>
                )}
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
        <Modal onClick={() => !isUploading && setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingChapter ? 'Edit Chapter' : 'Add Chapter'}</ModalTitle>
              <CloseButton onClick={() => !isUploading && setShowModal(false)}>×</CloseButton>
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
                  disabled={isUploading}
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
                  disabled={isUploading}
                />
              </FormGroup>

              <FormGroup>
                <Label>Summary *</Label>
                <TextArea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Enter chapter summary/blink content"
                  required
                  disabled={isUploading}
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
                  disabled={isUploading}
                />
              </FormGroup>

              <FormGroup>
                <Label>Chapter PDF (Optional)</Label>
                <FileInputWrapper>
                  <FileInputLabel htmlFor="chapter-pdf-file">
                    <FiUpload />
                    <span>Click to upload chapter PDF</span>
                    <span style={{ fontSize: fontSize.xs, color: colors.textLight }}>
                      Max size: 20MB
                    </span>
                    <input
                      id="chapter-pdf-file"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </FileInputLabel>
                  {formData.pdfFile && (
                    <FileName>{formData.pdfFile.name}</FileName>
                  )}
                </FileInputWrapper>
              </FormGroup>

              {isUploading && uploadProgress > 0 && (
                <ProgressBar>
                  <ProgressFill progress={uploadProgress} />
                </ProgressBar>
              )}

              <SubmitButton type="submit" disabled={isUploading}>
                {isUploading 
                  ? `${uploadProgress < 100 ? 'Uploading...' : 'Saving...'} ${uploadProgress}%`
                  : editingChapter ? 'Update Chapter' : 'Create Chapter'}
              </SubmitButton>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default ManageChaptersPage;
