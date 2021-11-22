import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';
import { ErrorCodes } from '@constants/ErrorCodes';
import { ErrorPage } from '../../pages/ErrorPage/ErrorPage';
import { useAppState } from '../../state';
import { ApiError } from '../../errors/ApiError';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '100%',
    flex: 1,
    overflow: 'hidden',

    [theme.breakpoints.up('md')]: {
      height: '100vh',
    },
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    height: '100%',
    display: 'grid',
    gridTemplateAreas: '"content image"',
    gridTemplateColumns: 'minmax(auto, 500px) 1fr',
    gridGap: theme.spacing(4),
    overflow: 'hidden',

    [theme.breakpoints.down('sm')]: {
      gridTemplateAreas: '"image" "content"',
      gridTemplateColumns: '1fr',
      gridTemplateRows: '260px 1fr',
    },
  },
}));

export function FormPage({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const classes = useStyles();

  const { error } = useAppState();

  if (error) {
    if (error instanceof ApiError) {
      return <ErrorPage type={error.errorCode} errorMessage={error.message} />;
    }
    return <ErrorPage type={ErrorCodes.UNEXPECTED} errorMessage={error.message} />;
  }

  return (
    <main {...props} className={clsx(classes.root, props.className)}>
      <div className={classes.content}>{children}</div>
    </main>
  );
}
