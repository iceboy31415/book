import React from 'react';
import styled from '@emotion/styled';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';
import { FiSearch } from 'react-icons/fi';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin-bottom: ${spacing.lg};
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: ${spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.textLight};
  font-size: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${spacing.md} ${spacing.md} ${spacing.md} 48px;
  font-size: ${fontSize.md};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${colors.primary}20;
  }

  &::placeholder {
    color: ${colors.textLight};
  }
`;

const SearchBar = ({ value, onChange, placeholder = "Search books, authors..." }) => {
  return (
    <SearchContainer>
      <SearchIcon />
      <SearchInput
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </SearchContainer>
  );
};

export default SearchBar;
