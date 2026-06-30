import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignUp from './SignUp';

const mockSignUp = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
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

jest.mock('../shared/ToastNotification', () => ({ message, isOpen, onClose }) =>
  isOpen ? <div data-testid="toast">{message}</div> : null
);

const renderSignUp = (props = {}) =>
  render(
    <MemoryRouter>
      <SignUp {...props} />
    </MemoryRouter>
  );

describe('SignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders all form fields', () => {
    renderSignUp();
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('renders Sign Up button (disabled by default)', () => {
    renderSignUp();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled();
  });

  it('shows validation error for empty name on blur', () => {
    renderSignUp();
    fireEvent.blur(screen.getByLabelText(/^name$/i));
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });

  it('shows validation error for name that is too short', () => {
    renderSignUp();
    const nameInput = screen.getByLabelText(/^name$/i);
    fireEvent.change(nameInput, { target: { name: 'name', value: 'A' } });
    fireEvent.blur(nameInput);
    expect(screen.getByText(/between 2 and 30/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email', () => {
    renderSignUp();
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { name: 'email', value: 'bad-email' } });
    fireEvent.blur(emailInput);
    expect(screen.getByText(/not a valid email/i)).toBeInTheDocument();
  });

  it('shows validation error for short password', () => {
    renderSignUp();
    const passwordInput = screen.getByLabelText(/^password$/i);
    fireEvent.change(passwordInput, { target: { name: 'password', value: '123' } });
    fireEvent.blur(passwordInput);
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', () => {
    renderSignUp();
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { name: 'password', value: 'password123' }
    });
    const confirm = screen.getByLabelText(/confirm password/i);
    fireEvent.change(confirm, { target: { name: 'confirmPassword', value: 'different' } });
    fireEvent.blur(confirm);
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('calls signUp with correct data on valid submit', async () => {
    mockSignUp.mockResolvedValueOnce({});
    renderSignUp();

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { name: 'name', value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: 'email', value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { name: 'password', value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { name: 'confirmPassword', value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
    });
  });

  it('shows success toast after successful registration', async () => {
    mockSignUp.mockResolvedValueOnce({});
    renderSignUp();

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { name: 'name', value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: 'email', value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { name: 'password', value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { name: 'confirmPassword', value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByTestId('toast')).toBeInTheDocument();
    });
  });

  it('shows error message when sign up fails', async () => {
    mockSignUp.mockRejectedValueOnce({
      response: { data: { message: 'Email already in use' } }
    });
    renderSignUp();

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { name: 'name', value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: 'email', value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { name: 'password', value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { name: 'confirmPassword', value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
  });

  it('calls onPageChange when Sign In link is clicked (modal mode)', () => {
    const onPageChange = jest.fn();
    renderSignUp({ onPageChange });
    fireEvent.click(screen.getByText(/sign in/i));
    expect(onPageChange).toHaveBeenCalledWith('sign-in');
  });
});
