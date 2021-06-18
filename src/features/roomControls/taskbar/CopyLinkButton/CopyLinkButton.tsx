import * as React from 'react';
import { CopyIcon } from '@components/icons/CopyIcon';
import { makeStyles, Button, useTheme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export interface ICopyLinkButtonProps {}

const useStyles = makeStyles((theme) => ({
  button: {
    color: theme.palette.brandColors.ink.regular,
    '&:hover': {
      backgroundColor: theme.palette.grey[300],
    },
  },
}));

// TODO: addin in analytics
export const CopyLinkButton: React.FC<ICopyLinkButtonProps> = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();

  const onCopy = () => {
    navigator.clipboard.writeText(window.location.toString());
    toast.success(t('features.roomControls.linkCopied') as string);
  };

  return (
    <Button
      variant="text"
      className={classes.button}
      startIcon={<CopyIcon htmlColor={theme.palette.brandColors.slate.ink} />}
      onClick={onCopy}
      fullWidth={false}
    >
      {t('features.roomControls.CopyLinkButtonText')}
    </Button>
  );
};
