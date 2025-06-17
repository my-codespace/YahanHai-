import React, { useState, useEffect } from 'react';

function Message({ message, type, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        background: type === 'success' ? '#4CAF50' : '#f44336',
        color: 'white',
        padding: '12px 24px',
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 9999,
      }}
    >
      {message}
      <button
        onClick={() => setVisible(false)}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          marginLeft: 16,
          cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  );
}

export default Message;
