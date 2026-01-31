import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';
import { FiLock, FiUser } from 'react-icons/fi';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%);
  padding: ${spacing.md};
`;

const LoginBox = styled.div`
  background: ${colors.background};
  border-radius: ${borderRadius.xl};
  box-shadow: ${shadows.xl};
  padding: ${spacing.xxl};
  width: 100%;
  max-width: 400px;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${spacing.xl};
`;

const LogoIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${spacing.md};
`;

const Title = styled.h1`
  font-size: ${fontSize.xxl};
  font-weight: bold;
  color: ${colors.text};
  text-align: center;
  margin-bottom: ${spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${fontSize.sm};
  color: ${colors.textSecondary};
  text-align: center;
  margin-bottom: ${spacing.xl};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const Label = styled.label`
  font-size: ${fontSize.sm};
  font-weight: 600;
  color: ${colors.text};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: ${spacing.md};
  color: ${colors.textLight};
  display: flex;
  align-items: center;
  
  svg {
    font-size: 20px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${spacing.md} ${spacing.md} ${spacing.md} 48px;
  font-size: ${fontSize.md};
  border: 2px solid ${colors.border};
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

const ErrorMessage = styled.div`
  background: ${colors.error}20;
  color: ${colors.error};
  padding: ${spacing.md};
  border-radius: ${borderRadius.md};
  font-size: ${fontSize.sm};
  text-align: center;
`;

const LoginButton = styled.button`
  width: 100%;
  background: ${colors.primary};
  color: ${colors.background};
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.md};
  font-size: ${fontSize.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  margin-top: ${spacing.md};

  &:hover {
    background: ${colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${shadows.md};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${colors.backgroundGray};
    color: ${colors.textLight};
    cursor: not-allowed;
    transform: none;
  }
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  font-size: ${fontSize.sm};
  text-align: center;
  cursor: pointer;
  margin-top: ${spacing.md};
  width: 100%;

  &:hover {
    text-decoration: underline;
  }
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const result = await login(formData.username, formData.password);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <Container>
      <LoginBox>
        <Logo>
          <LogoIcon>🔐</LogoIcon>
          <Title>Admin Login</Title>
          <Subtitle>Sign in to manage BookBlinks</Subtitle>
        </Logo>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor="username">Username or Email</Label>
            <InputWrapper>
              <InputIcon>
                <FiUser />
              </InputIcon>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username or email"
                disabled={isLoading}
                autoComplete="username"
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <InputWrapper>
              <InputIcon>
                <FiLock />
              </InputIcon>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </InputWrapper>
          </FormGroup>

          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </LoginButton>

          <BackLink onClick={() => navigate('/')} type="button">
            ← Back to Home
          </BackLink>
        </Form>
      </LoginBox>
    </Container>
  );
};

export default LoginPage;
