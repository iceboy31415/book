import React from 'react';
import styled from '@emotion/styled';
import { colors } from '../styles/theme';

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const Spinner = styled.div`
  border: 4px solid ${colors.backgroundGray};
  border-top: 4px solid ${colors.primary};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingSpinner = () => {
  return (
    <SpinnerContainer>
      <Spinner />
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
