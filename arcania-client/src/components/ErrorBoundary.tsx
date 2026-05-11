import React from 'react';
import { logReactError } from '@/services/error-logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logReactError(error, info.componentStack ?? undefined);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#1a1a2e', color: '#e0e0e0', minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', padding: '2rem',
        }}>
          <div style={{ maxWidth: 600, textAlign: 'center' }}>
            <h1 style={{ color: '#ff6b6b', fontSize: '1.5rem', marginBottom: '1rem' }}>
              Something went wrong
            </h1>
            {import.meta.env.DEV && (
              <pre style={{
                background: '#16213e', padding: '1rem', borderRadius: 8,
                textAlign: 'left', overflow: 'auto', fontSize: '0.85rem',
                maxHeight: 300, color: '#fca5a5',
              }}>
                {this.state.error?.message}
                {'\n\n'}
                {this.state.error?.stack}
              </pre>
            )}
            {!import.meta.env.DEV && (
              <p style={{ color: '#a0a0a0', marginTop: '0.5rem' }}>
                The error has been logged automatically.
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1.5rem', padding: '0.75rem 2rem',
                background: '#e94560', color: '#fff', border: 'none',
                borderRadius: 6, cursor: 'pointer', fontSize: '1rem',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
