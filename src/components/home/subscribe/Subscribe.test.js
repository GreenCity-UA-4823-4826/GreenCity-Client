import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Subscribe from './Subscribe';

jest.mock('../../../services/translation/TranslationService', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

describe('Subscribe', () => {
  const renderSubscribe = () => {
    render(<Subscribe />);

    return {
      emailInput: screen.getByPlaceholderText('homepage.subscription.placeholder'),
      subscribeButton: screen.getByRole('button', {
        name: 'homepage.subscription.button-subscribe'
      })
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('disables the subscribe button when email is empty', () => {
    const { subscribeButton } = renderSubscribe();

    expect(subscribeButton).toBeDisabled();
  });

  it('disables the subscribe button when email is invalid', () => {
    const { emailInput, subscribeButton } = renderSubscribe();

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    expect(subscribeButton).toBeDisabled();
  });

  it('enables the subscribe button when email is valid', () => {
    const { emailInput, subscribeButton } = renderSubscribe();

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    expect(subscribeButton).toBeEnabled();
  });

  it('sends user@example.com to the backend', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('')
    });
    const { emailInput, subscribeButton } = renderSubscribe();

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(subscribeButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/mvp/news-subscribers', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ email: 'user@example.com' })
      });
    });
  });

  it('shows an already subscribed message when the backend rejects a duplicate', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      text: jest.fn().mockResolvedValue('')
    });
    const { emailInput, subscribeButton } = renderSubscribe();

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(subscribeButton);

    expect(await screen.findByText('homepage.subscription.already-subscribed')).toBeInTheDocument();
  });

  it('disables the subscribe button when email contains an internal space', () => {
    const { emailInput, subscribeButton } = renderSubscribe();

    fireEvent.change(emailInput, { target: { value: 'user @example.com' } });

    expect(subscribeButton).toBeDisabled();
  });
});
