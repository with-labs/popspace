import React, { ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { logger } from '../../utils/logger';

interface IErrorBoundaryProps {
  fallback: () => ReactNode;
}

// Callback for the Sentry ErrorBoundary component that will log errors to the browser console in development mode.
const devOnError = (error: Error, componentStack: string) => {
  logger.error(error, componentStack);
};

// Wrap the Sentry ErrorBoundary component and add an onError function to log things to the browser console in
// development mode.
export const ErrorBoundary: React.FC<IErrorBoundaryProps> = ({ children, fallback }) => {
  return (
    <Sentry.ErrorBoundary fallback={fallback} onError={devOnError}>
      {children}
    </Sentry.ErrorBoundary>
  );
};
