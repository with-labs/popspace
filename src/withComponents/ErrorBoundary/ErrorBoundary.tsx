import React, { ReactNode } from 'react';

interface IErrorBoundaryProps {
  fallback: () => ReactNode;
}

export class ErrorBoundary extends React.Component<IErrorBoundaryProps> {
  state = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return {
      error,
    };
  }

  componentDidCatch(error: Error, info: {}) {
    // TODO Log to an external service.
    console.error(error, info);
  }

  render() {
    const { children, fallback } = this.props;
    const { error } = this.state;

    return error ? fallback() : children;
  }
}
