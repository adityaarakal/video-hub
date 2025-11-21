import React, { useEffect } from 'react';
import { CheckCircle2, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose} aria-label="Close">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;

