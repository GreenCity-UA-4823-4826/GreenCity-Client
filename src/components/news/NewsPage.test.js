import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NewsPage from './NewsPage';
import NewsService from '../../services/news/NewsService';

jest.mock('../../services/news/NewsService', () => ({
  getNewsByFilter: jest.fn(),
  getNewsHttpParams: jest.fn((params) => params),
  addToFavorites: jest.fn(),
  removeFromFavorites: jest.fn()
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: jest.fn(() => false),
    currentUser: null
  })
}));

jest.mock('../shared/TagFilter', () => ({ tags, onTagSelect, selectedTags }) => (
  <div data-testid="tag-filter">
    {tags.map((tag) => (
      <button key={tag.id} onClick={() => onTagSelect([tag.id])}>
        {tag.name}
      </button>
    ))}
  </div>
));

jest.mock('./NewsItem', () => ({ news }) => (
  <div data-testid={`news-item-${news.id}`}>{news.title}</div>
));

const mockNewsResponse = {
  page: [
    { id: 1, title: 'Article One', tags: [], author: { name: 'Author 1' } },
    { id: 2, title: 'Article Two', tags: [], author: { name: 'Author 2' } }
  ],
  totalElements: 2,
  totalPages: 1
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <NewsPage />
    </MemoryRouter>
  );

describe('NewsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    NewsService.getNewsByFilter.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/loading news/i)).toBeInTheDocument();
  });

  it('renders news items after loading', async () => {
    NewsService.getNewsByFilter.mockResolvedValueOnce(mockNewsResponse);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Article One')).toBeInTheDocument();
      expect(screen.getByText('Article Two')).toBeInTheDocument();
    });
  });

  it('shows news count after loading', async () => {
    NewsService.getNewsByFilter.mockResolvedValueOnce(mockNewsResponse);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/2 news found/i)).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    NewsService.getNewsByFilter.mockRejectedValueOnce(new Error('Network error'));
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/failed to load news/i)).toBeInTheDocument();
    });
  });

  it('shows "no news found" when results are empty', async () => {
    NewsService.getNewsByFilter.mockResolvedValueOnce({
      page: [],
      totalElements: 0,
      totalPages: 0
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/no news found/i)).toBeInTheDocument();
    });
  });

  it('shows search input when search button is clicked', async () => {
    NewsService.getNewsByFilter.mockResolvedValueOnce(mockNewsResponse);
    renderPage();

    await waitFor(() => screen.getByText('Article One'));

    fireEvent.click(screen.getByLabelText(/search news/i));
    expect(screen.getByPlaceholderText(/search news/i)).toBeInTheDocument();
  });

  it('shows "Load More" button when there are more pages', async () => {
    NewsService.getNewsByFilter.mockResolvedValueOnce({
      ...mockNewsResponse,
      totalPages: 3
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument();
    });
  });

  it('does not show "Load More" when all news are loaded', async () => {
    NewsService.getNewsByFilter.mockResolvedValueOnce(mockNewsResponse);
    renderPage();

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
    });
  });

  it('shows "no more news" message after all pages loaded', async () => {
    NewsService.getNewsByFilter.mockResolvedValueOnce(mockNewsResponse);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/no more news to load/i)).toBeInTheDocument();
    });
  });

  it('renders tag filter', async () => {
    NewsService.getNewsByFilter.mockResolvedValueOnce(mockNewsResponse);
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('tag-filter')).toBeInTheDocument();
    });
  });
});
