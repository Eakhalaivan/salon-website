import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-on-surface)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            color: 'var(--color-error)',
            fontFamily: 'var(--font-headline-sm)',
            fontSize: '2rem',
            marginBottom: '1rem' 
          }}>
            Something went wrong.
          </h1>
          <p style={{
            fontFamily: 'var(--font-body-md)',
            color: 'var(--color-on-surface-variant)',
            maxWidth: '600px',
            marginBottom: '2rem'
          }}>
            An unexpected error occurred. Our team has been notified.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              border: 'none',
              borderRadius: '9999px',
              fontFamily: 'var(--font-label-md)',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
