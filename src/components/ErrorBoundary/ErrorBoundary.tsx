import { ErrorCodes } from '@constants/ErrorCodes';
import { ErrorPage } from '@src/pages/ErrorPage/ErrorPage';
import { logger } from '@utils/logger';
import React, { ReactNode } from 'react';

interface IErrorBoundaryProps {
  fallback: () => ReactNode;
}

export class ErrorBoundary extends React.Component<IErrorBoundaryProps, { error: Error | null }> {
  public static defaultProps = {
    fallback: () => <ErrorPage type={ErrorCodes.UNEXPECTED} />,
  };

  state = {
    error: null,
  };

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(error, errorInfo);
    this.setState({ error });
  }

  public render() {
    if (this.state.error) {
      return this.props.fallback();
    }
    return <>{this.props.children}</>;
  }
}
