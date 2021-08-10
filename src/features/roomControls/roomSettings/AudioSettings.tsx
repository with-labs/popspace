import { makeStyles, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { GlobalAudioToggle } from '../audio/GlobalAudioToggle';

const useStyles = makeStyles((theme) => ({
  textBorder: {
    flex: '1 0 0',
    border: '1px solid ' + theme.palette.grey[500],
    borderRadius: theme.shape.borderRadius,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),

    margin: theme.spacing(1),
    marginLeft: theme.spacing(3),

    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
    },
  },
  content: {
    flex: '3 1 0',
    minHeight: 0,
    padding: theme.spacing(1),
  },
  audioPanel: {
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(3),
    paddingLeft: 0,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
      paddingLeft: theme.spacing(3),
    },
  },
}));

export function AudioSettings() {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.audioPanel}>
      <GlobalAudioToggle className={classes.content} />
      <div className={classes.textBorder}>
        <Typography variant="body1" paragraph>
          {t('features.roomSettings.audioHeading')}
        </Typography>
        <Typography variant="body2" paragraph>
          {t('features.roomSettings.audioExplanation')}
        </Typography>
      </div>
    </div>
  );
}
