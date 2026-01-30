import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { favoritesAPI, progressAPI, getDeviceId } from '../services/api';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing.lg} ${spacing.md};
`;

const Header = styled.div`
  margin-bottom: ${spacing.xl};
`;

const Title = styled.h1`
  font-size: ${fontSize.xxl};
  font-weight: bold;
  color: ${colors.text};
  margin-bottom: ${spacing.lg};

  @media (max-width: 768px) {
    font-size: ${fontSize.xl};
  }
`;

const Tabs = styled.div`
  display: flex;
  background: ${colors.backgroundGray};
  border-radius: ${borderRadius.md};
  padding: 4px;
  gap: 4px;
`;

const Tab = styled.button`
  flex: 1;
  padding: ${spacing.sm} ${spacing.md};
  background: ${props => props.active ? colors.background : 'transparent'};
  color: ${props => props.active ? colors.primary : colors.textSecondary};
  font-size: ${fontSize.sm};
  font-weight: ${props => props.active ? '600' : '500'};
  border-radius: ${borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${colors.primary};
  }
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${spacing.md};

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing.xxl};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${spacing.md};
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

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const deviceId = getDeviceId();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [favoritesResponse, progressResponse] = await Promise.all([
        favoritesAPI.getAll(deviceId),
        progressAPI.getAll(deviceId),
      ]);

      setFavorites(favoritesResponse.data);
      setProgress(progressResponse.data);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const displayData = activeTab === 'favorites' ? favorites : progress;

  return (
    <Container>
      <Header>
        <Title>My Library</Title>
        <Tabs>
          <Tab
            active={activeTab === 'favorites'}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites ({favorites.length})
          </Tab>
          <Tab
            active={activeTab === 'progress'}
            onClick={() => setActiveTab('progress')}
          >
            In Progress ({progress.length})
          </Tab>
        </Tabs>
      </Header>

      {displayData.length > 0 ? (
        <BooksGrid>
          {displayData.map((item) => (
            <BookCard
              key={item.id}
              book={item}
              showProgress={activeTab === 'progress'}
              progress={activeTab === 'progress' ? item.percentComplete : 0}
            />
          ))}
        </BooksGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>{activeTab === 'favorites' ? '❤️' : '📖'}</EmptyIcon>
          <EmptyText>
            {activeTab === 'favorites' ? 'No favorites yet' : 'No books in progress'}
          </EmptyText>
          <EmptySubtext>
            {activeTab === 'favorites'
              ? 'Start adding books to your favorites'
              : 'Start reading to track your progress'}
          </EmptySubtext>
        </EmptyState>
      )}
    </Container>
  );
};

export default LibraryPage;
