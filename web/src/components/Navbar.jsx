import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { colors, spacing, fontSize, shadows } from '../styles/theme';
import { FiHome, FiBookmark, FiGrid, FiSettings } from 'react-icons/fi';

const Nav = styled.nav`
  background: ${colors.background};
  box-shadow: ${shadows.sm};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
`;

const Logo = styled(Link)`
  font-size: ${fontSize.xl};
  font-weight: bold;
  color: ${colors.primary};
  text-decoration: none;
  
  &:hover {
    color: ${colors.primaryDark};
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${spacing.lg};
  align-items: center;

  @media (max-width: 768px) {
    gap: ${spacing.md};
  }
`;

const NavLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.xs};
  color: ${props => props.active ? colors.primary : colors.textSecondary};
  font-size: ${fontSize.sm};
  font-weight: ${props => props.active ? '600' : '400'};
  text-decoration: none;
  padding: ${spacing.sm} ${spacing.md};
  border-radius: 8px;
  transition: all 0.2s;

  svg {
    font-size: 20px;
  }

  &:hover {
    color: ${colors.primary};
    background: ${colors.backgroundGray};
  }

  @media (max-width: 768px) {
    font-size: ${fontSize.xs};
    padding: ${spacing.xs} ${spacing.sm};
    
    svg {
      font-size: 18px;
    }
  }
`;

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Nav>
      <NavContainer>
        <Logo to="/">📚 Blinkist Clone</Logo>
        <NavLinks>
          <NavLink to="/" active={isActive('/')}>
            <FiHome />
            <span>Home</span>
          </NavLink>
          <NavLink to="/library" active={isActive('/library')}>
            <FiBookmark />
            <span>Library</span>
          </NavLink>
          <NavLink to="/categories" active={isActive('/categories')}>
            <FiGrid />
            <span>Categories</span>
          </NavLink>
          <NavLink to="/admin" active={isActive('/admin')}>
            <FiSettings />
            <span>Admin</span>
          </NavLink>
        </NavLinks>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;
