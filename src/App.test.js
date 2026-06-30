import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('./components/home/HomePage', () => () => <div data-testid="home-page">HomePage</div>);
jest.mock('./components/about/AboutPage', () => () => <div data-testid="about-page">AboutPage</div>);
jest.mock('./components/auth/SignIn', () => () => <div data-testid="sign-in">SignIn</div>);
jest.mock('./components/auth/SignUp', () => () => <div data-testid="sign-up">SignUp</div>);
jest.mock('./components/auth/ForgotPassword', () => () => <div>ForgotPassword</div>);
jest.mock('./components/news/NewsPage', () => () => <div>NewsPage</div>);
jest.mock('./components/news/NewsDetail', () => () => <div>NewsDetail</div>);
jest.mock('./components/map/MapPage', () => () => <div>MapPage</div>);
jest.mock('./components/profile/ProfilePage', () => () => <div>ProfilePage</div>);
jest.mock('./components/events/EventsPage', () => () => <div>EventsPage</div>);
jest.mock('./components/ubs-user/UbsUserCabinet', () => () => <div>UbsUserCabinet</div>);
jest.mock('./components/shared/Layout', () => ({ children }) => <div data-testid="layout">{children}</div>);
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    currentUser: null,
    loading: false,
    isAuthenticated: jest.fn(() => false),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn()
  })
}));
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>
}));
jest.mock('./config/settings', () => ({
  AUTH_SETTINGS: { googleClientId: 'mock-client-id' }
}));

import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('renders home page by default', () => {
    render(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
