import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NewsDetail from './NewsDetail';
import NewsService from '../../services/news/NewsService';

jest.mock('../../services/news/NewsService', () => ({
  getNewsById: jest.fn()
}));

const mockArticle = {
  id: 42,
  title: 'Green Energy Future',
  content: 'This is the full article content about green energy.',
  imagePath: 'https://example.com/green.jpg',
  creationDate: '2024-05-20T12:00:00',
  author: { name: 'Eco Writer' },
  tags: ['EDUCATION', 'NEWS']
};

const renderDetail = (id = '42') =>
  render(
    <MemoryRouter initialEntries={[`/news/${id}`]}>
      <Routes>
        <Route path="/news/:id" element={<NewsDetail />} />
      </Routes>
    </MemoryRouter>
  );

describe('NewsDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    NewsService.getNewsById.mockReturnValue(new Promise(() => {}));
    renderDetail();
    expect(screen.getByText(/loading article/i)).toBeInTheDocument();
  });

  it('renders article title after loading', async () => {
    NewsService.getNewsById.mockResolvedValueOnce(mockArticle);
    renderDetail();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Green Energy Future' })).toBeInTheDocument();
    });
  });

  it('renders article content', async () => {
    NewsService.getNewsById.mockResolvedValueOnce(mockArticle);
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText(/full article content/i)).toBeInTheDocument();
    });
  });

  it('renders author name', async () => {
    NewsService.getNewsById.mockResolvedValueOnce(mockArticle);
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('Eco Writer')).toBeInTheDocument();
    });
  });

  it('renders article image', async () => {
    NewsService.getNewsById.mockResolvedValueOnce(mockArticle);
    renderDetail();

    await waitFor(() => {
      const img = screen.getByAltText('Green Energy Future');
      expect(img).toHaveAttribute('src', 'https://example.com/green.jpg');
    });
  });

  it('renders tags', async () => {
    NewsService.getNewsById.mockResolvedValueOnce(mockArticle);
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('EDUCATION')).toBeInTheDocument();
      expect(screen.getByText('NEWS')).toBeInTheDocument();
    });
  });

  it('renders breadcrumb navigation', async () => {
    NewsService.getNewsById.mockResolvedValueOnce(mockArticle);
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('News')).toBeInTheDocument();
    });
  });

  it('renders "Back to News" button', async () => {
    NewsService.getNewsById.mockResolvedValueOnce(mockArticle);
    renderDetail();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back to news/i })).toBeInTheDocument();
    });
  });

  it('calls getNewsById with correct id', async () => {
    NewsService.getNewsById.mockResolvedValueOnce(mockArticle);
    renderDetail('42');

    await waitFor(() => {
      expect(NewsService.getNewsById).toHaveBeenCalledWith('42');
    });
  });

  it('shows error message when API fails', async () => {
    NewsService.getNewsById.mockRejectedValueOnce(new Error('Not found'));
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText(/failed to load the article/i)).toBeInTheDocument();
    });
  });

  it('shows Back button in error state', async () => {
    NewsService.getNewsById.mockRejectedValueOnce(new Error('Not found'));
    renderDetail();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back to news/i })).toBeInTheDocument();
    });
  });

  it('does not render image section when imagePath is missing', async () => {
    NewsService.getNewsById.mockResolvedValueOnce({ ...mockArticle, imagePath: null });
    renderDetail();

    await waitFor(() => {
      expect(screen.queryByAltText('Green Energy Future')).not.toBeInTheDocument();
    });
  });

  it('renders formatted creation date', async () => {
    NewsService.getNewsById.mockResolvedValueOnce(mockArticle);
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText(/may 20, 2024/i)).toBeInTheDocument();
    });
  });
});
