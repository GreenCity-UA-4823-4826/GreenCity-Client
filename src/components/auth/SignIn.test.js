import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignIn from './SignIn';

const mockSignIn = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    isAuthenticated: jest.fn(() => false),
    currentUser: null
  })
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

jest.mock('../../services/translation/TranslationService', () => ({
  useTranslation: () => ({
    t: (key, fallback) => (typeof fallback === 'string' ? fallback : key),
    currentLanguage: 'en',
    changeLanguage: jest.fn()
  })
}));

jest.mock('./GoogleButton', () => ({ onSuccess, onError }) => (
  <button data-testid="google-btn" onClick={() => onSuccess({ id: '1' })}>
    Google
  </button>
));

jest.mock('../../constants/imagePaths', () => ({
  AUTH_IMAGES: { EYE_HIDE: 'eye-hide.png', EYE_SHOW: 'eye-show.png' }
}));

const renderSignIn = (props = {}) =>
  render(
    <MemoryRouter>
      <SignIn {...props} />
    </MemoryRouter>
  );

describe('SignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password fields', () => {
    renderSignIn();
    expect(screen.getByPlaceholderText(/example@email\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  it('renders Sign In button', () => {
    renderSignIn();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders Google button', () => {
    renderSignIn();
    expect(screen.getByTestId('google-btn')).toBeInTheDocument();
  });

  it('shows validation error when email is empty on blur', () => {
    renderSignIn();
    const emailInput = screen.getByPlaceholderText(/example@email\.com/i);
    fireEvent.blur(emailInput);
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email format', () => {
    renderSignIn();
    const emailInput = screen.getByPlaceholderText(/example@email\.com/i);
    fireEvent.change(emailInput, { target: { name: 'email', value: 'not-an-email' } });
    fireEvent.blur(emailInput);
    expect(screen.getByText(/not a valid email/i)).toBeInTheDocument();
  });

  it('shows validation error when password is empty on blur', () => {
    renderSignIn();
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    fireEvent.blur(passwordInput);
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it('shows error for short password', () => {
    renderSignIn();
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    fireEvent.change(passwordInput, { target: { name: 'password', value: '123' } });
    fireEvent.blur(passwordInput);
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it('calls signIn with correct credentials on submit', async () => {
    mockSignIn.mockResolvedValueOnce({ userId: '1' });
    renderSignIn();

    fireEvent.change(screen.getByPlaceholderText(/example@email\.com/i), {
      target: { name: 'email', value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { name: 'password', value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('navigates to home after successful sign in', async () => {
    mockSignIn.mockResolvedValueOnce({ userId: '1' });
    renderSignIn();

    fireEvent.change(screen.getByPlaceholderText(/example@email\.com/i), {
      target: { name: 'email', value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { name: 'password', value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('calls onClose after successful sign in when provided', async () => {
    mockSignIn.mockResolvedValueOnce({ userId: '1' });
    const onClose = jest.fn();
    renderSignIn({ onClose });

    fireEvent.change(screen.getByPlaceholderText(/example@email\.com/i), {
      target: { name: 'email', value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { name: 'password', value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows error message when sign in fails', async () => {
    mockSignIn.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } }
    });
    renderSignIn();

    fireEvent.change(screen.getByPlaceholderText(/example@email\.com/i), {
      target: { name: 'email', value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { name: 'password', value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('calls onPageChange when Forgot Password link is clicked (modal mode)', () => {
    const onPageChange = jest.fn();
    renderSignIn({ onPageChange });

    fireEvent.click(screen.getByText(/forgot password/i));
    expect(onPageChange).toHaveBeenCalledWith('restore-password');
  });

  it('calls onPageChange when Sign Up link is clicked (modal mode)', () => {
    const onPageChange = jest.fn();
    renderSignIn({ onPageChange });

    fireEvent.click(screen.getByText(/sign up/i));
    expect(onPageChange).toHaveBeenCalledWith('sign-up');
  });

  it('submit button is disabled when fields are empty', () => {
    renderSignIn();
    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    expect(submitBtn).toBeDisabled();
  });
});
