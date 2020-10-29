import React from 'react';
import clsx from 'clsx';
import { makeStyles, CircularProgress, Box } from '@material-ui/core';

import { ErrorPage } from '../../pages/ErrorPage/ErrorPage';
import { ErrorInfo } from '../../types/api';

interface IPageProps {
  isLoading?: boolean;
  error?: ErrorInfo;
  className?: string;
  children?: React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
  },
}));

export const Page: React.FC<IPageProps> = (props) => {
  const { isLoading, children, error, className } = props;
  const classes = useStyles();

  return error ? (
    <ErrorPage type={error.errorType} errorMessage={error.error?.message} />
  ) : (
    <main className={clsx(classes.root, className)}>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
          <CircularProgress />
        </Box>
      ) : (
        children
      )}
    </main>
  );
};
