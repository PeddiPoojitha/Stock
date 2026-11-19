import React from 'react';

export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="state-box">
      <div className="spinner" />
      <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        {message}
      </div>
    </div>
  );
}
