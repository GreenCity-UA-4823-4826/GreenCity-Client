import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import NewsService from '../../services/news/NewsService';
import './NewsDetail.scss';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await NewsService.getNewsById(id);
        setNews(data);
      } catch (err) {
        console.error('Error loading news article:', err);
        setError('Failed to load the article. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="news-detail">
        <div className="container">
          <div className="news-detail__loading">Loading article...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-detail">
        <div className="container">
          <div className="news-detail__error">
            <p>{error}</p>
            <button className="btn-back" onClick={() => navigate('/news')}>← Back to News</button>
          </div>
        </div>
      </div>
    );
  }

  if (!news) return null;

  return (
    <div className="news-detail">
      <div className="container">
        <nav className="news-detail__breadcrumb">
          <Link to="/">Home</Link>
          <span> / </span>
          <Link to="/news">News</Link>
          <span> / </span>
          <span>{news.title}</span>
        </nav>

        <article className="news-detail__article">
          {news.imagePath && (
            <div className="news-detail__image">
              <img src={news.imagePath} alt={news.title} />
            </div>
          )}

          <div className="news-detail__header">
            {news.tags && news.tags.length > 0 && (
              <div className="news-detail__tags">
                {news.tags.map((tag, i) => (
                  <span key={tag?.id ?? i} className="news-tag">
                    {typeof tag === 'string' ? tag : tag?.name}
                  </span>
                ))}
              </div>
            )}
            <h1 className="news-detail__title">{news.title}</h1>
            <div className="news-detail__meta">
              <span className="news-author">{news.author?.name || 'Unknown Author'}</span>
              <span className="news-date">{formatDate(news.creationDate)}</span>
            </div>
          </div>

          <div className="news-detail__content">
            {news.content || news.text}
          </div>
        </article>

        <button className="btn-back" onClick={() => navigate('/news')}>← Back to News</button>
      </div>
    </div>
  );
};

export default NewsDetail;
