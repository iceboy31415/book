import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';

const Card = styled.div`
  display: flex;
  background: ${colors.background};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.md};
  box-shadow: ${shadows.sm};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: ${spacing.sm};
  }
`;

const CoverContainer = styled.div`
  position: relative;
  margin-right: ${spacing.md};
  flex-shrink: 0;
`;

const Cover = styled.img`
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: ${borderRadius.md};
  background: ${colors.backgroundGray};

  @media (max-width: 768px) {
    width: 80px;
    height: 120px;
  }
`;

const PlaceholderCover = styled.div`
  width: 100px;
  height: 150px;
  background: ${colors.backgroundGray};
  border-radius: ${borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;

  @media (max-width: 768px) {
    width: 80px;
    height: 120px;
    font-size: 32px;
  }
`;

const ProgressOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom-left-radius: ${borderRadius.md};
  border-bottom-right-radius: ${borderRadius.md};
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: ${colors.primary};
  width: ${props => props.progress}%;
  transition: width 0.3s;
`;

const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Title = styled.h3`
  font-size: ${fontSize.md};
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: ${spacing.xs};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 768px) {
    font-size: ${fontSize.sm};
  }
`;

const Author = styled.p`
  font-size: ${fontSize.sm};
  color: ${colors.textSecondary};
  margin-bottom: ${spacing.sm};

  @media (max-width: 768px) {
    font-size: ${fontSize.xs};
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CategoryBadge = styled.span`
  background: ${colors.primary}20;
  color: ${colors.primary};
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.sm};
  font-size: ${fontSize.xs};
  font-weight: 600;
`;

const Chapters = styled.span`
  font-size: ${fontSize.xs};
  color: ${colors.textLight};
`;

const BookCard = ({ book, showProgress = false, progress = 0 }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/book/${book.id || book.bookId}`);
  };

  return (
    <Card onClick={handleClick}>
      <CoverContainer>
        {book.coverImage ? (
          <Cover src={book.coverImage} alt={book.title} />
        ) : (
          <PlaceholderCover>📚</PlaceholderCover>
        )}
        {showProgress && progress > 0 && (
          <ProgressOverlay>
            <ProgressBar progress={progress} />
          </ProgressOverlay>
        )}
      </CoverContainer>

      <Info>
        <div>
          <Title>{book.title}</Title>
          <Author>{book.author}</Author>
        </div>

        <Footer>
          {book.category && (
            <CategoryBadge>{book.category}</CategoryBadge>
          )}
          {book.totalChapters > 0 && (
            <Chapters>{book.totalChapters} blinks</Chapters>
          )}
        </Footer>
      </Info>
    </Card>
  );
};

export default BookCard;
