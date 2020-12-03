import React from 'react';
import clsx from 'clsx';
import { makeStyles, CircularProgress, Box } from '@material-ui/core';
import { PageTitle } from '../../components/PageTitle/PageTitle';
import { ErrorPage } from '../../pages/ErrorPage/ErrorPage';
import { ErrorInfo } from '../../types/api';

interface IPageProps {
  isLoading?: boolean;
  error?: ErrorInfo;
  className?: string;
  children?: React.ReactNode;
  pageTitle?: string;
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
  const { isLoading, children, error, className, pageTitle } = props;
  const classes = useStyles();

  return error ? (
    <ErrorPage type={error.errorCode} errorMessage={error.error?.message} />
  ) : (
    <main className={clsx(classes.root, className)}>
      <PageTitle title={pageTitle} />
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
