import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { utilityAPI, booksAPI } from '../services/api';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';

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
`;

const Title = styled.h1`
  font-size: ${fontSize.xxl};
  font-weight: bold;
  color: ${colors.text};

  @media (max-width: 768px) {
    font-size: ${fontSize.xl};
  }
`;

const ClearButton = styled.button`
  color: ${colors.primary};
  font-size: ${fontSize.md};
  font-weight: 600;
  cursor: pointer;
  background: none;
  border: none;
  padding: ${spacing.sm} ${spacing.md};

  &:hover {
    opacity: 0.7;
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${spacing.md};

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const CategoryCard = styled.div`
  aspect-ratio: 1;
  background: ${props => props.active ? colors.primary + '20' : colors.backgroundGray};
  border: 2px solid ${props => props.active ? colors.primary : 'transparent'};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.md};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.active ? colors.primary + '30' : colors.border};
    transform: translateY(-2px);
    box-shadow: ${shadows.sm};
  }
`;

const CategoryName = styled.h3`
  font-size: ${fontSize.md};
  font-weight: 600;
  color: ${props => props.active ? colors.primary : colors.text};
  text-align: center;
  margin-bottom: ${spacing.xs};

  @media (max-width: 768px) {
    font-size: ${fontSize.sm};
  }
`;

const CategoryCount = styled.p`
  font-size: ${fontSize.xs};
  color: ${props => props.active ? colors.primary : colors.textLight};
`;

const SelectedCategoryTitle = styled.h2`
  font-size: ${fontSize.xl};
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: ${spacing.lg};
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
  color: ${colors.textSecondary};
`;

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await utilityAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = async (category) => {
    setSelectedCategory(category);
    try {
      const response = await booksAPI.getByCategory(category);
      setBooks(response.data);
    } catch (error) {
      console.error('Error loading books by category:', error);
    }
  };

  const clearSelection = () => {
    setSelectedCategory(null);
    setBooks([]);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <Header>
        <Title>Categories</Title>
        {selectedCategory && (
          <ClearButton onClick={clearSelection}>Clear</ClearButton>
        )}
      </Header>

      {!selectedCategory ? (
        <>
          {categories.length > 0 ? (
            <CategoriesGrid>
              {categories.map((category) => (
                <CategoryCard
                  key={category.category}
                  onClick={() => selectCategory(category.category)}
                >
                  <CategoryName>{category.category}</CategoryName>
                  <CategoryCount>
                    {category.count} book{category.count !== 1 ? 's' : ''}
                  </CategoryCount>
                </CategoryCard>
              ))}
            </CategoriesGrid>
          ) : (
            <EmptyState>No categories available</EmptyState>
          )}
        </>
      ) : (
        <>
          <SelectedCategoryTitle>{selectedCategory}</SelectedCategoryTitle>
          {books.length > 0 ? (
            <BooksGrid>
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </BooksGrid>
          ) : (
            <EmptyState>No books in this category</EmptyState>
          )}
        </>
      )}
    </Container>
  );
};

export default CategoriesPage;
