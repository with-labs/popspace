import React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { Links } from '../../../constants/Links';
import { ResponsiveIconButton } from '../../../components/ResponsiveIconButton/ResponsiveIconButton';
import { FeedbackIcon } from '../../../components/icons/FeedbackIcon';

interface ISendFeedback {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  button: {
    backgroundColor: theme.palette.brandColors.snow.regular,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.mainShadows.surface,
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
    <ResponsiveIconButton
      color="inherit"
      className={clsx(classes.button, className)}
      onClick={onClickHandler}
      size="small"
      startIcon={<FeedbackIcon fontSize="small" />}
      fullWidth={false}
      label={t('features.room.sendFeedbackBtn')}
    >
      {t('features.room.sendFeedbackBtn')}
    </ResponsiveIconButton>
  );
};
