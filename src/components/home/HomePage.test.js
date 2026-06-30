import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';
import UserService from '../../services/user/UserService';

jest.mock('../../services/user/UserService', () => ({
  countActivatedUsers: jest.fn()
}));

jest.mock('../../services/auth/TokenService', () => ({
  useTokenCheck: () => jest.fn()
}));

jest.mock('../../services/translation/TranslationService', () => ({
  useTranslation: () => ({
    t: (key, fallback) => (typeof fallback === 'string' ? fallback : key),
    currentLanguage: 'en',
    changeLanguage: jest.fn()
  })
}));

jest.mock('../../constants/imagePaths', () => ({
  HOME_IMAGES: {
    PATH_2: '/path-2.svg',
    PATH_4: '/path-4.png',
    PATH_5: '/path-5.png',
    GUY: '/guy.png'
  }
}));

// Mock the child components to simplify testing
jest.mock('./eco-events/EcoEvents', () => () => <div data-testid="eco-events">EcoEvents</div>);
jest.mock('./subscribe/Subscribe', () => () => <div data-testid="subscribe">Subscribe</div>);
jest.mock('./stat-rows/StatRows', () => () => <div data-testid="stat-rows">StatRows</div>);
jest.mock('../auth/AuthModal', () => ({ onClose }) => (
  <div data-testid="auth-modal">
    <button onClick={onClose}>Close</button>
  </div>
));

describe('HomePage Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
  });

  it('renders without crashing', () => {
    UserService.countActivatedUsers.mockResolvedValue(1234);

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    // Button renders with translation key since translations are not loaded in tests
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays the correct user count', async () => {
    const mockCount = 5678;
    UserService.countActivatedUsers.mockResolvedValue(mockCount);

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(new RegExp(String(mockCount)))).toBeInTheDocument();
    });

    // React 18 StrictMode may cause effects to run more than once in development
    expect(UserService.countActivatedUsers).toHaveBeenCalled();
  });

  it('renders child components', () => {
    // Mock the user service
    UserService.countActivatedUsers.mockResolvedValue(1000);

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Check that child components are rendered
    expect(screen.getByTestId('eco-events')).toBeInTheDocument();
    expect(screen.getByTestId('subscribe')).toBeInTheDocument();
    expect(screen.getByTestId('stat-rows')).toBeInTheDocument();
  });

  it('does not show auth modal by default', () => {
    // Mock the user service
    UserService.countActivatedUsers.mockResolvedValue(1000);

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Check that auth modal is not rendered by default
    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
  });

  // Additional tests would be added for:
  // - Testing the startHabit function with and without a userId
  // - Testing the auth modal opening and closing
  // - Testing the token checking functionality
});
