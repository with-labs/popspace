import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { ErrorPage } from '../../pages/ErrorPage/ErrorPage';
import { useAppState } from '../../state';
import { ApiError } from '../../utils/api';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
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

    [theme.breakpoints.down('md')]: {
      overflow: 'auto',
      gridTemplateAreas: '"image" "content"',
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'minmax(auto, 260px) 1fr',
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
