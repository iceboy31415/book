import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { booksAPI, progressAPI, utilityAPI, getDeviceId } from '../services/api';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing, fontSize } from '../styles/theme';

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

const Section = styled.section`
  margin-bottom: ${spacing.xxl};
`;

const SectionTitle = styled.h2`
  font-size: ${fontSize.xl};
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: ${spacing.lg};

  @media (max-width: 768px) {
    font-size: ${fontSize.lg};
  }
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${spacing.md};

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing.xxl};
  color: ${colors.textSecondary};
`;

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [continueReading, setContinueReading] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const deviceId = getDeviceId();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksResponse, progressResponse] = await Promise.all([
        booksAPI.getAll(),
        progressAPI.getAll(deviceId),
      ]);

      setBooks(booksResponse.data);

      const inProgress = progressResponse.data.filter(
        (p) => p.percentComplete > 0 && p.percentComplete < 100
      );
      setContinueReading(inProgress);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setSearching(true);
      try {
        const response = await utilityAPI.search(query);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const displayBooks = searchQuery.trim().length > 0 ? searchResults : books;

  return (
    <Container>
      <Header>
        <Title>Discover</Title>
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search books, authors..."
        />
      </Header>

      {continueReading.length > 0 && searchQuery.trim().length === 0 && (
        <Section>
          <SectionTitle>Continue Reading</SectionTitle>
          <BooksGrid>
            {continueReading.map((item) => (
              <BookCard
                key={item.id}
                book={item}
                showProgress
                progress={item.percentComplete}
              />
            ))}
          </BooksGrid>
        </Section>
      )}

      <Section>
        <SectionTitle>
          {searchQuery.trim().length > 0
            ? searching
              ? 'Searching...'
              : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`
            : 'All Books'}
        </SectionTitle>

        {displayBooks.length > 0 ? (
          <BooksGrid>
            {displayBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </BooksGrid>
        ) : (
          <EmptyState>
            {searchQuery.trim().length > 0
              ? 'No books found'
              : 'No books available yet'}
          </EmptyState>
        )}
      </Section>
    </Container>
  );
};

export default HomePage;
