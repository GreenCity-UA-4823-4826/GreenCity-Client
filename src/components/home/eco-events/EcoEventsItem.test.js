import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EcoEventsItem from './EcoEventsItem';

const renderItem = (author) =>
  render(
    <MemoryRouter>
      <EcoEventsItem
        ecoEvent={{
          id: 1,
          title: 'Eco news',
          content: 'News content',
          creationDate: '2026-07-21T12:00:00',
          author
        }}
      />
    </MemoryRouter>
  );

describe('EcoEventsItem', () => {
  it('renders an author returned as an object', () => {
    renderItem({ id: 1, name: 'GreenCity Admin' });
    expect(screen.getByText('GreenCity Admin')).toBeInTheDocument();
  });

  it('renders an author returned as a string', () => {
    renderItem('GreenCity Admin');
    expect(screen.getByText('GreenCity Admin')).toBeInTheDocument();
  });
});
