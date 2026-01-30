import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import {
  booksAPI,
  favoritesAPI,
  progressAPI,
  getDeviceId,
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';
import { FiArrowLeft, FiHeart } from 'react-icons/fi';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${spacing.lg} ${spacing.md};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  color: ${colors.primary};
  font-size: ${fontSize.md};
  font-weight: 600;
  margin-bottom: ${spacing.lg};
  cursor: pointer;
  background: none;
  border: none;
  padding: ${spacing.sm};
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const Header = styled.div`
  display: flex;
  gap: ${spacing.lg};
  margin-bottom: ${spacing.xl};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const Cover = styled.img`
  width: 200px;
  height: 300px;
  object-fit: cover;
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.md};

  @media (max-width: 768px) {
    width: 160px;
    height: 240px;
  }
`;

const PlaceholderCover = styled.div`
  width: 200px;
  height: 300px;
  background: ${colors.backgroundGray};
  border-radius: ${borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  box-shadow: ${shadows.md};

  @media (max-width: 768px) {
    width: 160px;
    height: 240px;
    font-size: 48px;
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: ${fontSize.xxl};
  font-weight: bold;
  color: ${colors.text};
  margin-bottom: ${spacing.sm};

  @media (max-width: 768px) {
    font-size: ${fontSize.xl};
  }
`;

const Author = styled.p`
  font-size: ${fontSize.lg};
  color: ${colors.textSecondary};
  margin-bottom: ${spacing.md};
`;

const CategoryBadge = styled.span`
  display: inline-block;
  background: ${colors.primary}20;
  color: ${colors.primary};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};
  font-size: ${fontSize.sm};
  font-weight: 600;
  margin-bottom: ${spacing.md};
`;

const Stats = styled.div`
  display: flex;
  gap: ${spacing.lg};
  margin-bottom: ${spacing.lg};
  font-size: ${fontSize.sm};
  color: ${colors.textLight};

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const FavoriteButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  background: ${props => props.isFavorite ? colors.error : colors.backgroundGray};
  color: ${props => props.isFavorite ? colors.background : colors.text};
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.md};
  font-size: ${fontSize.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }

  svg {
    font-size: 20px;
  }
`;

const Section = styled.section`
  margin-bottom: ${spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: ${fontSize.xl};
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: ${spacing.lg};
`;

const Description = styled.p`
  font-size: ${fontSize.md};
  color: ${colors.textSecondary};
  line-height: 1.6;
`;

const ProgressBarContainer = styled.div`
  height: 8px;
  background: ${colors.backgroundGray};
  border-radius: ${borderRadius.sm};
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: ${colors.primary};
  width: ${props => props.progress}%;
  transition: width 0.3s;
`;

const ChaptersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const ChapterItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${spacing.md};
  background: ${props => props.isRead ? colors.primary + '10' : colors.backgroundGray};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.isRead ? colors.primary + '20' : colors.border};
    transform: translateX(4px);
  }
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
  margin-right: ${spacing.md};
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

const Checkmark = styled.span`
  font-size: 24px;
  color: ${colors.primary};
`;

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [progress, setProgress] = useState({ chaptersRead: [], percentComplete: 0 });

  const deviceId = getDeviceId();

  useEffect(() => {
    loadBookDetails();
  }, [id]);

  const loadBookDetails = async () => {
    setLoading(true);
    try {
      const [bookResponse, favoriteResponse, progressResponse] = await Promise.all([
        booksAPI.getById(id),
        favoritesAPI.checkFavorite(deviceId, id),
        progressAPI.getByBook(deviceId, id),
      ]);

      setBook(bookResponse.data);
      setChapters(bookResponse.data.chapters || []);
      setIsFavorite(favoriteResponse.data.isFavorited);
      setProgress(progressResponse.data);
    } catch (error) {
      console.error('Error loading book details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoritesAPI.remove(deviceId, id);
        setIsFavorite(false);
      } else {
        await favoritesAPI.add(deviceId, id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const openChapter = (chapterNumber) => {
    navigate(`/book/${id}/chapter/${chapterNumber}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!book) {
    return (
      <Container>
        <p>Book not found</p>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </BackButton>

      <Header>
        {book.coverImage ? (
          <Cover src={book.coverImage} alt={book.title} />
        ) : (
          <PlaceholderCover>📚</PlaceholderCover>
        )}

        <HeaderInfo>
          <Title>{book.title}</Title>
          <Author>{book.author}</Author>

          {book.category && <CategoryBadge>{book.category}</CategoryBadge>}

          <Stats>
            <span>{chapters.length} blinks</span>
            {progress.percentComplete > 0 && (
              <span>{Math.round(progress.percentComplete)}% complete</span>
            )}
          </Stats>

          <FavoriteButton onClick={toggleFavorite} isFavorite={isFavorite}>
            <FiHeart fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? 'Favorited' : 'Add to Favorites'}
          </FavoriteButton>
        </HeaderInfo>
      </Header>

      {book.description && (
        <Section>
          <SectionTitle>About this book</SectionTitle>
          <Description>{book.description}</Description>
        </Section>
      )}

      {progress.percentComplete > 0 && (
        <Section>
          <ProgressBarContainer>
            <ProgressBar progress={progress.percentComplete} />
          </ProgressBarContainer>
        </Section>
      )}

      <Section>
        <SectionTitle>Blinks ({chapters.length})</SectionTitle>
        <ChaptersList>
          {chapters.map((chapter) => {
            const isRead = progress.chaptersRead.includes(chapter.chapterNumber);
            return (
              <ChapterItem
                key={chapter.id}
                isRead={isRead}
                onClick={() => openChapter(chapter.chapterNumber)}
              >
                <ChapterNumber>{chapter.chapterNumber}</ChapterNumber>
                <ChapterInfo>
                  <ChapterTitle>{chapter.title}</ChapterTitle>
                  <ReadTime>{chapter.readTimeMinutes} min read</ReadTime>
                </ChapterInfo>
                {isRead && <Checkmark>✓</Checkmark>}
              </ChapterItem>
            );
          })}
        </ChaptersList>
      </Section>
    </Container>
  );
};

export default BookDetailPage;
