'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8F7FF',
        color: '#1A1726',
        padding: '2rem',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Something went wrong
        </h2>
        <p style={{ color: 'rgba(26,23,38,0.5)', fontSize: '0.875rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          {error.message}
        </p>
        <pre style={{
          color: 'rgba(255,82,82,0.8)',
          fontSize: '0.7rem',
          background: 'rgba(255,82,82,0.05)',
          padding: '1rem',
          borderRadius: '0.75rem',
          maxWidth: '100%',
          overflow: 'auto',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255,82,82,0.1)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {error.stack}
        </pre>
        <button
          onClick={reset}
          style={{
            background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
