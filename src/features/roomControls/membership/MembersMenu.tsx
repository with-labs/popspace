import * as React from 'react';
import { IconButton, Hidden, makeStyles, Typography } from '@material-ui/core';
import { InviteIcon } from '../../../components/icons/InviteIcon';
import { DropdownIcon } from '../../../components/icons/DropdownIcon';
import { MembershipManagement } from './MembershipManagement';
import { ResponsiveMenu } from '../../../components/ResponsiveMenu/ResponsiveMenu';
import { InviteLink } from '../InviteLink/InviteLink';
import { useFeatureFlag } from 'flagg';
import { useTranslation } from 'react-i18next';

export interface IMembersMenuProps {}

const useStyles = makeStyles((theme) => ({
  largeMenu: {
    width: '100%',
    maxHeight: 360,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      width: 360,
    },
  },
  title: {
    marginBottom: theme.spacing(2),
  },
}));

/**
 * Renders the members dropdown menu and the grouping of controls which
 * trigger / interact with it
 */
export const MembersMenu = React.forwardRef<HTMLDivElement, IMembersMenuProps>((_, ref) => {
  const anchorRef = React.useRef<any>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [autoFocusInvite, setAutoFocusInvite] = React.useState(false);
  const classes = useStyles();
  const { t } = useTranslation();

  const [hasInviteLink] = useFeatureFlag('inviteLink');

  const onOpen = React.useCallback(() => {
    setIsOpen(true);
  }, []);
  const openAndFocusInvite = React.useCallback(() => {
    setIsOpen(true);
    setAutoFocusInvite(true);
  }, []);
  const onClose = React.useCallback(() => {
    setIsOpen(false);
    setAutoFocusInvite(false);
  }, []);

  return (
    <div ref={ref}>
      {
        <>
          <IconButton onClick={openAndFocusInvite}>
            <InviteIcon />
          </IconButton>
          <Hidden smDown>
            <IconButton ref={anchorRef} onClick={onOpen}>
              <DropdownIcon />
            </IconButton>
          </Hidden>
          <ResponsiveMenu anchorEl={anchorRef.current} open={isOpen} onClose={onClose}>
            {hasInviteLink && (
              <div>
                <div className={classes.title}>
                  <Typography variant="h3">{t('features.roomControls.linkInviteTitle')}</Typography>
                </div>
                <InviteLink />
              </div>
            )}
            <div>
              <div className={classes.title}>
                <Typography variant="h3">{t('features.roomControls.emailInviteTitle')}</Typography>
              </div>
              <MembershipManagement autoFocusInvite={autoFocusInvite} className={classes.largeMenu} />
            </div>
          </ResponsiveMenu>
        </>
      }
    </div>
  );
});
