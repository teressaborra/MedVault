import React from 'react';
import './Modal.css';

function Modal({ isOpen, onClose, title, message, type = 'info' }) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#0f0';
      case 'error':
        return '#f00';
      case 'warning':
        return '#ffa500';
      default:
        return 'var(--brand)';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-popup" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon" style={{ color: getColor() }}>
          {getIcon()}
        </div>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <button className="modal-button" onClick={onClose} style={{ background: getColor() }}>
          OK
        </button>
      </div>
    </div>
  );
}

export default Modal;
