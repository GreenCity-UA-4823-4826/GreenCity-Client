import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './EcoEventsItem.scss';

const EcoEventsItem = ({ ecoEvent, mainEvent = false }) => {
  if (!ecoEvent) return null;

  const authorName =
    typeof ecoEvent.author === 'string'
      ? ecoEvent.author
      : ecoEvent.author?.name || 'Unknown Author';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`eco-event-item ${mainEvent ? 'main-event-item' : ''}`}>
      <div className="event-content">
        <h3 className="event-title">
          <Link to={`/news/${ecoEvent.id}`}>{ecoEvent.title}</Link>
        </h3>
        <p className="event-description">{ecoEvent.content}</p>
        <div className="event-info">
          <span className="event-author">{authorName}</span>
          <span className="event-date">{formatDate(ecoEvent.creationDate)}</span>
        </div>
      </div>
    </div>
  );
};

EcoEventsItem.propTypes = {
  ecoEvent: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    title: PropTypes.string,
    content: PropTypes.string,
    creationDate: PropTypes.string,
    author: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string
      })
    ])
  }),
  mainEvent: PropTypes.bool
};

export default EcoEventsItem;
