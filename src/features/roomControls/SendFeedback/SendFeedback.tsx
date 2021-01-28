import React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles, IconButton, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { Links } from '../../../constants/Links';

import { ReactComponent as FeatureIcon } from '../../../images/icons/feature.svg';
interface ISendFeedback {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  button: {
    backgroundColor: theme.palette.brandColors.snow.regular,
    borderRadius: theme.shape.borderRadius,
    padding: `${theme.spacing(1.5)}px 20px`,
    boxShadow: theme.mainShadows.surface,
  },
  buttonText: {
    marginLeft: theme.spacing(2),
    textTransform: 'none',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

export const SendFeedback: React.FC<ISendFeedback> = (props) => {
  const { className } = props;
  const { t } = useTranslation();
  const classes = useStyles();

  const onClickHandler = () => {
    window.open(`${Links.FEEDBACK}/feedback`, '__blank');
  };

  return (
    <IconButton
      aria-label={t('features.room.sendFeedbackBtn')}
      color="inherit"
      className={clsx(classes.button, className)}
      onClick={onClickHandler}
    >
      <FeatureIcon />
      <Typography aira-hidden={true} variant="button" className={classes.buttonText}>
        {t('features.room.sendFeedbackBtn')}
      </Typography>
    </IconButton>
  );
};
