import { makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    bottom: '40px',
    left: '40px',
    background: theme.palette.brandColors.cherry.bold,
    boxShadow: theme.mainShadows.modal,
    padding: '4px',
    borderRadius: '14px',
  },
}));

const URL = 'https://www.producthunt.com/posts/tilde';
const POST_ID = '304185';
const DESCRIPTION = 'Join us on Product Hunt';

export function ProductHuntButton() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <a href={URL} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
        <img
          src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${POST_ID}&theme=light`}
          alt={DESCRIPTION}
          style={{ width: '250px', height: '54px', display: 'block' }}
          width="250"
          height="54"
        />
      </a>
    </div>
  );
}
