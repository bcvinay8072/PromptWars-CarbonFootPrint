import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  /** Child components to be wrapped by the error boundary */
  children: ReactNode;
}

interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error message */
  errorMessage: string;
}

/**
 * React Error Boundary component that catches JavaScript errors in its child
 * component tree, logs them, and renders a graceful fallback UI instead of
 * crashing the entire application.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  /** Resets the error state so the user can retry */
  private handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="glass-panel error-container"
          role="alert"
          aria-live="assertive"
        >
          <h2 className="text-error mb-md">
            Something went wrong
          </h2>
          <p className="text-secondary-clr mb-lg">
            {this.state.errorMessage || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleRetry}
            aria-label="Retry loading the application"
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
