import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NewsItem from './NewsItem';

const mockNews = {
  id: 1,
  title: 'Eco Tips for Daily Life',
  shortInfo: 'Short description of the article',
  content: 'Full content of the article',
  imagePath: 'https://example.com/image.jpg',
  creationDate: '2024-06-15T10:00:00',
  author: { name: 'Jane Smith' },
  tags: ['EDUCATION', 'EVENTS']
};

const renderItem = (props = {}) =>
  render(
    <MemoryRouter>
      <NewsItem news={mockNews} {...props} />
    </MemoryRouter>
  );

describe('NewsItem', () => {
  it('renders article title', () => {
    renderItem();
    expect(screen.getByText('Eco Tips for Daily Life')).toBeInTheDocument();
  });

  it('renders author name', () => {
    renderItem();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders tags', () => {
    renderItem();
    expect(screen.getByText('EDUCATION')).toBeInTheDocument();
    expect(screen.getByText('EVENTS')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    renderItem();
    expect(screen.getByText(/june 15, 2024/i)).toBeInTheDocument();
  });

  it('renders a link to the news detail page', () => {
    renderItem();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/news/1');
  });

  it('renders image with correct src', () => {
    renderItem();
    const img = screen.getByAltText('Eco Tips for Daily Life');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('uses default image when imagePath is missing', () => {
    renderItem({ news: { ...mockNews, imagePath: null } });
    const img = screen.getByAltText('Eco Tips for Daily Life');
    expect(img).toHaveAttribute('src', 'assets/img/main-event-placeholder.png');
  });

  it('truncates content in gallery view (100 chars)', () => {
    const longContent = 'A'.repeat(200);
    renderItem({ news: { ...mockNews, shortInfo: longContent }, isGalleryView: true });
    expect(screen.getByText(/A{100}\.\.\./)).toBeInTheDocument();
  });

  it('applies gallery-view CSS class by default', () => {
    const { container } = renderItem();
    expect(container.querySelector('.news-item')).toHaveClass('gallery-view');
  });

  it('applies list-view CSS class when isGalleryView is false', () => {
    const { container } = renderItem({ isGalleryView: false });
    expect(container.querySelector('.news-item')).toHaveClass('list-view');
  });

  it('shows "Unknown Author" when author is missing', () => {
    renderItem({ news: { ...mockNews, author: null } });
    expect(screen.getByText('Unknown Author')).toBeInTheDocument();
  });

  it('renders without tags when tags array is empty', () => {
    renderItem({ news: { ...mockNews, tags: [] } });
    expect(screen.queryByText('EDUCATION')).not.toBeInTheDocument();
  });
});
