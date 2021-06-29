import * as React from 'react';
import { CopyIcon } from '@components/icons/CopyIcon';
import { makeStyles, Button, useTheme, Hidden, IconButton } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export interface ICopyLinkButtonProps {}

const useStyles = makeStyles((theme) => ({
  button: {
    color: theme.palette.brandColors.ink.regular,
    '&:hover': {
      backgroundColor: theme.palette.grey[300],
    },
  },
  iconButton: {
    borderRadius: theme.shape.contentBorderRadius,
  },
}));

// TODO: addin in analytics
export const CopyLinkButton: React.FC<ICopyLinkButtonProps> = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();

  const [copied, setCopied] = React.useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(window.location.toString());
    setCopied(true);
  };

  React.useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return (
    <>
      <Hidden mdDown>
        <Button
          variant="text"
          className={classes.button}
          startIcon={<CopyIcon htmlColor={theme.palette.brandColors.slate.ink} />}
          onClick={onCopy}
          fullWidth={false}
        >
          {copied ? t('features.roomControls.linkCopied') : t('features.roomControls.copyLinkButtonText')}
        </Button>
      </Hidden>
      <Hidden lgUp>
        <IconButton onClick={onCopy} classes={{ root: classes.iconButton }}>
          <CopyIcon htmlColor={theme.palette.brandColors.slate.ink} />
        </IconButton>
      </Hidden>
    </>
  );
};
