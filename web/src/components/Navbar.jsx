import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, fontSize, shadows } from '../styles/theme';
import { FiHome, FiBookmark, FiGrid, FiSettings, FiLogOut } from 'react-icons/fi';

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
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  
  &:hover {
    color: ${colors.primaryDark};
  }
`;

const LogoIcon = styled.span`
  font-size: 28px;
`;

const LogoText = styled.span`
  @media (max-width: 480px) {
    display: none;
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

const LogoutButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.xs};
  color: ${colors.error};
  font-size: ${fontSize.sm};
  font-weight: 400;
  background: none;
  border: none;
  padding: ${spacing.sm} ${spacing.md};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  svg {
    font-size: 20px;
  }

  &:hover {
    background: ${colors.error}10;
  }

  @media (max-width: 768px) {
    font-size: ${fontSize.xs};
    padding: ${spacing.xs} ${spacing.sm};
    
    svg {
      font-size: 18px;
    }
  }
`;

const AdminBadge = styled.span`
  background: ${colors.primary};
  color: ${colors.background};
  font-size: ${fontSize.xs};
  padding: 2px 8px;
  border-radius: ${fontSize.xs};
  font-weight: 600;
  margin-left: ${spacing.sm};
`;

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Nav>
      <NavContainer>
        <Logo to="/">
          <LogoIcon>📚</LogoIcon>
          <LogoText>
            BookBlinks
            {isAuthenticated && <AdminBadge>Admin</AdminBadge>}
          </LogoText>
        </Logo>
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
          <NavLink to="/admin" active={location.pathname.startsWith('/admin') && location.pathname !== '/admin/login'}>
            <FiSettings />
            <span>Admin</span>
          </NavLink>
          {isAuthenticated && (
            <LogoutButton onClick={handleLogout}>
              <FiLogOut />
              <span>Logout</span>
            </LogoutButton>
          )}
        </NavLinks>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;
