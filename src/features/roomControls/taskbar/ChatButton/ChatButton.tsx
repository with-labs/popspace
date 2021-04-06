import * as React from 'react';
import { makeStyles, Button, Hidden, IconButton, ThemeProvider } from '@material-ui/core';
import { useCurrentUserProfile } from '../../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { ChatIcon } from '../../../../components/icons/ChatIcon';
import { useTranslation } from 'react-i18next';
import { slate } from '../../../../theme/theme';

const useStyles = makeStyles((theme) => ({
  button: {
    borderRadius: '15px',
    color: theme.palette.brandColors.slate.ink,
  },
}));

interface IChatButtonProps {}

export const ChatButton: React.FC<IChatButtonProps> = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { user } = useCurrentUserProfile();

  const handleButtonClick = () => {
    if (!window.$crisp.get('user:nickname')) {
      window.$crisp.push(['set', 'user:nickname', [user?.display_name]]);
    }

    if (!window.$crisp.get('user:email')) {
      window.$crisp.push(['set', 'user:email', [user?.email]]);
    }

    if (window.$crisp.is('chat:opened')) {
      window.$crisp.push(['do', 'chat:close']);
    } else {
      window.$crisp.push(['do', 'chat:show']);
      window.$crisp.push(['do', 'chat:open']);
    }
  };
  return (
    <ThemeProvider theme={slate}>
      <Hidden smDown>
        <Button
          variant="outlined"
          onClick={handleButtonClick}
          startIcon={<ChatIcon />}
          className={classes.button}
          size="small"
        >
          <ThemeProvider theme={slate}>{t('features.chat.buttonText')}</ThemeProvider>
        </Button>
      </Hidden>
      <Hidden smUp>
        <IconButton onClick={handleButtonClick}>
          <ChatIcon />
        </IconButton>
      </Hidden>
    </ThemeProvider>
  );
};
