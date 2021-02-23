import React, { useState } from 'react';
import clsx from 'clsx';
import { Menu, MenuItem, Divider, ListItemIcon, ListItemText, Button, makeStyles, Typography } from '@material-ui/core';
import { Links } from '../../constants/Links';
import { USER_SUPPORT_EMAIL } from '../../constants/User';
import { useTranslation } from 'react-i18next';
import { removeSessionToken } from '../../utils/sessionToken';

import { ReactComponent as DropdownIcon } from '../../images/icons/dropdown.svg';
import { ReactComponent as SignOutIcon } from '../../images/icons/sign_out.svg';
import { ReactComponent as SupportIcon } from '../../images/icons/support.svg';
import { ReactComponent as DocumentIcon } from '../../images/icons/document.svg';
import { ReactComponent as FeatureIcon } from '../../images/icons/feature.svg';
import { Link } from '../Link/Link';
import { RouteNames } from '../../constants/RouteNames';
import { LinkMenuItem } from '../LinkMenuItem/LinkMenuItem';
import { Logo } from '../Logo/Logo';

interface IHeaderProps {
  text?: string;
  isFullLength?: boolean;
  userName?: string;
}

const useStyles = makeStyles((theme) => ({
  headerWrapper: {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
  },
  header: {
    padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
  },
  headerFull: {
    padding: `${theme.spacing(2)}px 0 ${theme.spacing(2)}px ${theme.spacing(1)}px`,
  },
  text: {
    paddingLeft: theme.spacing(2),
  },
  buttonContainer: {
    marginLeft: 'auto',
  },
}));

export const Header: React.FC<IHeaderProps> = (props) => {
  const classes = useStyles();
  const { text, userName, isFullLength = false } = props;
  const [menuAchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const { t } = useTranslation();

  const onMenuOpenHandler = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const onMenuCloseHandler = () => {
    setMenuAnchorEl(null);
  };

  const onSignoutHandler = () => {
    // delete the session token
    removeSessionToken();
    // TODO: should make a call to invalidate the token on the back end as well

    // redirect to landing page
    window.location.href = Links.LANDING_PAGE;
  };

  let menuContents: React.ReactNode | null = null;
  if (userName) {
    menuContents = (
      <>
        <Button
          variant="text"
          color="inherit"
          endIcon={<DropdownIcon />}
          aria-controls="user-menu"
          aria-haspopup="true"
          onClick={onMenuOpenHandler}
        >
          {userName}
        </Button>
        <Menu
          id="user-menu"
          anchorEl={menuAchorEl}
          keepMounted
          open={Boolean(menuAchorEl)}
          onClose={onMenuCloseHandler}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <LinkMenuItem newTab to={`mailto:${USER_SUPPORT_EMAIL}`}>
            <ListItemIcon>
              <SupportIcon />
            </ListItemIcon>
            <ListItemText primary={t('header.support')} />
          </LinkMenuItem>
          <LinkMenuItem newTab to={Links.FEEDBACK}>
            <ListItemIcon>
              <FeatureIcon />
            </ListItemIcon>
            <ListItemText primary={t('header.feedback')} />
          </LinkMenuItem>
          <Divider variant="middle" />
          <LinkMenuItem newTab to={Links.TOS}>
            <ListItemIcon>
              <DocumentIcon />
            </ListItemIcon>
            <ListItemText primary={t('header.tos')} />
          </LinkMenuItem>
          <LinkMenuItem newTab to={Links.PRIVACY_POLICY}>
            <ListItemIcon>
              <DocumentIcon />
            </ListItemIcon>
            <ListItemText primary={t('header.privacyPolicy')} />
          </LinkMenuItem>
          <Divider variant="middle" />
          <MenuItem onClick={onSignoutHandler}>
            <ListItemIcon>
              <SignOutIcon />
            </ListItemIcon>
            <ListItemText primary={t('header.logout')} />
          </MenuItem>
        </Menu>
      </>
    );
  } else {
    menuContents = (
      <Button component={Link} disableStyling to={RouteNames.SIGN_IN}>
        {t('header.signin')}
      </Button>
    );
  }

  return (
    <header
      className={clsx(classes.headerWrapper, {
        [classes.header]: !isFullLength,
        [classes.headerFull]: isFullLength,
      })}
    >
      <Logo />
      <Typography variant="body1" className={classes.text}>
        {text}
      </Typography>
      <div className={classes.buttonContainer}>{menuContents}</div>
    </header>
  );
};
