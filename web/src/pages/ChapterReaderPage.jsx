import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { chaptersAPI, progressAPI, getDeviceId } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${spacing.lg} ${spacing.md};
  min-height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${spacing.md};
  border-bottom: 1px solid ${colors.border};
  margin-bottom: ${spacing.xl};
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

const Progress = styled.div`
  font-size: ${fontSize.sm};
  color: ${colors.textLight};
  font-weight: 500;
`;

const Content = styled.div`
  flex: 1;
  margin-bottom: ${spacing.xl};
`;

const ChapterHeader = styled.div`
  text-align: center;
  margin-bottom: ${spacing.xxl};
`;

const ChapterBadge = styled.div`
  display: inline-block;
  background: ${colors.primary}20;
  color: ${colors.primary};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};
  font-size: ${fontSize.sm};
  font-weight: 600;
  margin-bottom: ${spacing.md};
`;

const ChapterTitle = styled.h1`
  font-size: ${fontSize.xxl};
  font-weight: bold;
  color: ${colors.text};
  margin-bottom: ${spacing.sm};

  @media (max-width: 768px) {
    font-size: ${fontSize.xl};
  }
`;

const ReadTime = styled.p`
  font-size: ${fontSize.sm};
  color: ${colors.textLight};
`;

const Summary = styled.div`
  font-size: ${fontSize.md};
  color: ${colors.text};
  line-height: 1.8;
  text-align: justify;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${spacing.md};
  padding-top: ${spacing.md};
  border-top: 1px solid ${colors.border};
`;

const NavButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  background: ${props => props.disabled ? colors.backgroundGray : colors.primary};
  color: ${props => props.disabled ? colors.textLight : colors.background};
  font-size: ${fontSize.md};
  font-weight: 600;
  border-radius: ${borderRadius.md};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;

  &:hover {
    opacity: ${props => props.disabled ? 1 : 0.9};
  }

  svg {
    font-size: 20px;
  }
`;

const ChapterReaderPage = () => {
  const { id, chapterNumber } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [totalChapters, setTotalChapters] = useState(0);
  const [loading, setLoading] = useState(true);

  const deviceId = getDeviceId();
  const currentChapter = parseInt(chapterNumber);

  useEffect(() => {
    loadChapter();
    markAsRead();
  }, [id, chapterNumber]);

  const loadChapter = async () => {
    setLoading(true);
    try {
      const response = await chaptersAPI.getByBookId(id);
      const chapters = response.data;
      const current = chapters.find((c) => c.chapterNumber === currentChapter);

      setChapter(current);
      setTotalChapters(chapters.length);
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      const progressResponse = await progressAPI.getByBook(deviceId, id);
      const chaptersRead = Array.isArray(progressResponse.data.chaptersRead)
        ? progressResponse.data.chaptersRead
        : [];

      if (!chaptersRead.includes(currentChapter)) {
        const updatedChaptersRead = [...chaptersRead, currentChapter];
        await progressAPI.createOrUpdate({
          deviceId,
          bookId: id,
          chaptersRead: updatedChaptersRead,
          lastReadChapter: currentChapter,
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const goToNext = () => {
    if (currentChapter < totalChapters) {
      navigate(`/book/${id}/chapter/${currentChapter + 1}`);
    } else {
      alert('You have finished all blinks in this book!');
      navigate(`/book/${id}`);
    }
  };

  const goToPrevious = () => {
    if (currentChapter > 1) {
      navigate(`/book/${id}/chapter/${currentChapter - 1}`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!chapter) {
    return (
      <Container>
        <p>Chapter not found</p>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(`/book/${id}`)}>
          <FiArrowLeft /> Back
        </BackButton>
        <Progress>
          {currentChapter} / {totalChapters}
        </Progress>
      </Header>

      <Content>
        <ChapterHeader>
          <ChapterBadge>Blink {currentChapter}</ChapterBadge>
          <ChapterTitle>{chapter.title}</ChapterTitle>
          <ReadTime>{chapter.readTimeMinutes} min read</ReadTime>
        </ChapterHeader>

        <Summary>{chapter.summary}</Summary>
      </Content>

      <Footer>
        <NavButton
          onClick={goToPrevious}
          disabled={currentChapter === 1}
        >
          <FiArrowLeft />
          Previous
        </NavButton>

        <NavButton onClick={goToNext}>
          {currentChapter < totalChapters ? 'Next' : 'Finish'}
          <FiArrowRight />
        </NavButton>
      </Footer>
    </Container>
  );
};

export default ChapterReaderPage;
