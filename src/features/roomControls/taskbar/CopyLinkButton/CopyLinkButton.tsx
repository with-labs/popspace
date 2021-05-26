import * as React from 'react';
import { CopyIcon } from '@components/icons/CopyIcon';
import { makeStyles, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export interface ICopyLinkButtonProps {}

const useStyles = makeStyles((theme) => ({
  button: {
    color: theme.palette.brandColors.ink.regular,
  },
}));

// TODO: addin in analytics
export const CopyLinkButton: React.FC<ICopyLinkButtonProps> = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const onCopy = () => {
    alert('copyTBD');
  };

  return (
    <Button variant="text" className={classes.button} startIcon={<CopyIcon />} onClick={onCopy}>
      {t('features.roomControls.CopyLinkButtonText')}
    </Button>
  );
};
