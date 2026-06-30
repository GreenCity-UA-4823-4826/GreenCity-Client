import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './ToastNotification.scss';

const ToastNotification = ({ message, type = 'success', isOpen, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen || !message) return null;

  return (
    <div className={`toast-notification toast-notification--${type}`} role="alert">
      <span className="toast-notification__message">{message}</span>
      <button className="toast-notification__close" onClick={onClose} aria-label="Close">✕</button>
    </div>
  );
};

ToastNotification.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number
};

export default ToastNotification;
