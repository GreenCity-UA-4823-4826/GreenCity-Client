import { normalizeAuthenticatedUser } from './AuthContext';

jest.mock('../services/auth/AuthService', () => ({}));
jest.mock('../services/auth/GoogleAuthService', () => ({}));

describe('normalizeAuthenticatedUser', () => {
  it('maps the Google response userId to id', () => {
    const user = normalizeAuthenticatedUser({
      userId: 16,
      name: 'GreenCity',
      accessToken: 'token'
    });

    expect(user).toEqual({
      userId: 16,
      id: 16,
      name: 'GreenCity',
      accessToken: 'token'
    });
  });

  it('keeps an existing id', () => {
    const user = normalizeAuthenticatedUser({ id: 7, userId: 16 });

    expect(user.id).toBe(7);
  });
});
