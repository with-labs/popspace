import React, { useState } from 'react';
import {
  makeStyles,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Typography,
  ThemeProvider,
  CircularProgress,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { DeleteIcon } from '../../../../components/icons/DeleteIcon';
import { EmailIcon } from '../../../../components/icons/EmailIcon';
import { OptionsIcon } from '../../../../components/icons/OptionsIcon';
import { MemberListAvatar } from './MemberListAvatar';

import { Modal } from '../../../../components/Modal/Modal';
import { ModalActions } from '../../../../components/Modal/ModalActions';
import { ModalTitleBar } from '../../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../../components/Modal/ModalContentWrapper';

import { cherry, snow } from '../../../../theme/theme';
import { USER_SESSION_TOKEN } from '../../../../constants/User';
import Api from '../../../../utils/api';
import { ErrorModal } from '../../../room/modals/ErrorModal/ErrorModal';
import { useSnackbar } from 'notistack';
import { BaseResponse } from '../../../../utils/api';
import * as Sentry from '@sentry/react';
import { ErrorCodes } from '../../../../constants/ErrorCodes';

export type UserListMemberInfo = {
  avatar_url: string | null;
  display_name: string | null;
  email: string;
  has_accepted: boolean;
  user_id: string | null;
};

interface IMemberListProps {
  members: any[];
  onMemberRemove: (member: any) => void;
  roomName: string;
}

const useStyles = makeStyles((theme) => ({
  memberList: {
    width: '100%',
  },
  deleteColor: {
    color: theme.palette.brandColors.cherry.bold,
  },
  activeTextColor: {
    color: theme.palette.brandColors.ink.regular,
  },
  inactiveTextColor: {
    color: theme.palette.brandColors.slate.ink,
  },
  buttonMargin: {
    marginTop: theme.spacing(2),
  },
}));

export const MemberList: React.FC<IMemberListProps> = ({ members, onMemberRemove, roomName }) => {
  const classes = useStyles();
  const [error, setError] = useState<BaseResponse | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const [isBusy, setIsBusy] = useState(false);

  const [menuAchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<UserListMemberInfo>({
    avatar_url: null,
    display_name: null,
    email: '',
    has_accepted: false,
    user_id: null,
  });
  const { t } = useTranslation();

  const [confirmIsOpen, setConfirmIsOpen] = useState(false);

  const onMenuOpenHandler = (event: React.MouseEvent<HTMLElement>, memberIndex: number) => {
    // close any existing menu we have
    setMenuAnchorEl(null);
    // get the selected member from the members list
    const currentMember = members[memberIndex];

    // if current member is null, we wont open the menu
    if (currentMember) {
      setSelectedMember(currentMember);
      // open a new menu
      setMenuAnchorEl(event.currentTarget);
    }
  };

  const onMenuCloseHandler = () => {
    setMenuAnchorEl(null);
  };

  const sessionToken = localStorage.getItem(USER_SESSION_TOKEN);

  const inviteResendHandler = async () => {
    try {
      setMenuAnchorEl(null);
      setIsBusy(true);
      const result: BaseResponse = await Api.sendRoomInvite(sessionToken, roomName, selectedMember.email);
      if (result.success) {
        enqueueSnackbar(t('modals.inviteUserModal.resendInviteSuccess'), { variant: 'success' });
      } else {
        setError(result);
      }
    } catch (err) {
      Sentry.captureMessage(`Error memberlist invite resend handler`, Sentry.Severity.Error);
      setError({
        success: false,
        errorCode: ErrorCodes.UNEXPECTED,
      });
    } finally {
      setIsBusy(false);
    }
  };

  const cancelInviteHandler = async () => {
    try {
      setMenuAnchorEl(null);
      setIsBusy(true);
      const result: BaseResponse = await Api.cancelRoomInvite(sessionToken, roomName, selectedMember.email);
      if (result.success) {
        onMemberRemove(selectedMember);
      } else {
        setError(result);
      }
    } catch (err) {
      Sentry.captureMessage(`Error memberlist cancel invite handler`, Sentry.Severity.Error);
      setError({
        success: false,
        errorCode: ErrorCodes.UNEXPECTED,
      });
    } finally {
      setIsBusy(false);
    }
  };

  const removeUserHandler = () => {
    setMenuAnchorEl(null);
    setConfirmIsOpen(true);
  };

  const confirmRemoveUserHandler = async () => {
    try {
      setConfirmIsOpen(false);
      setIsBusy(true);
      const result: BaseResponse = await Api.removeRoomMember(sessionToken, roomName, selectedMember.email);
      if (result.success) {
        onMemberRemove(selectedMember);
      } else {
        setError(result);
      }
    } catch (err) {
      Sentry.captureMessage(`Error memberlist remove handler`, Sentry.Severity.Error);
      setError({
        success: false,
        errorCode: ErrorCodes.UNEXPECTED,
      });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Box overflow="auto">
      <List className={classes.memberList}>
        {members.map((member, index) => {
          return (
            <ListItem key={member.email}>
              <ListItemAvatar>
                <MemberListAvatar avatarName={member.avatar_url} hasAccepted={member.has_accepted} />
              </ListItemAvatar>
              {/* we want the mulit-line text for this, so re-enable Typography*/}
              <ListItemText
                primary={member.display_name || t('modals.inviteUserModal.invitedUser')}
                secondary={member.email}
                disableTypography={false}
                classes={{
                  primary: member.has_accepted ? classes.activeTextColor : classes.inactiveTextColor,
                  secondary: classes.inactiveTextColor,
                }}
              />
              <ListItemSecondaryAction>
                <div>
                  {selectedMember?.email === member.email && isBusy ? (
                    <CircularProgress />
                  ) : (
                    <IconButton edge="end" aria-label="member_options" onClick={(e) => onMenuOpenHandler(e, index)}>
                      <OptionsIcon />
                    </IconButton>
                  )}
                </div>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
      <Menu
        id="member-menu"
        anchorEl={menuAchorEl}
        keepMounted
        open={Boolean(menuAchorEl)}
        onClose={onMenuCloseHandler}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {selectedMember?.has_accepted ? (
          <MenuItem onClick={removeUserHandler}>
            <ListItemIcon>
              <DeleteIcon className={classes.deleteColor} />
            </ListItemIcon>
            <ListItemText primary={t('modals.inviteUserModal.removeUser')} className={classes.deleteColor} />
          </MenuItem>
        ) : (
          <div>
            {/* TODO: commenting this out until we fix resend email on the backend */}
            {/* <MenuItem onClick={inviteResendHandler}>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText primary={t('modals.inviteUserModal.resendInvite')} />
            </MenuItem> */}
            <MenuItem onClick={cancelInviteHandler}>
              <ListItemIcon>
                <DeleteIcon className={classes.deleteColor} />
              </ListItemIcon>
              <ListItemText primary={t('modals.inviteUserModal.deleteInvite')} className={classes.deleteColor} />
            </MenuItem>
          </div>
        )}
      </Menu>
      <Modal isOpen={confirmIsOpen} onClose={() => setConfirmIsOpen(false)} maxWidth="xs">
        <ModalTitleBar title={t('modals.inviteUserModal.removeConfirmTitle', { user: selectedMember?.display_name })} />
        <ModalContentWrapper>
          <Typography variant="body1">
            {t('modals.inviteUserModal.removeConfirmDesc', { user: selectedMember?.display_name })}
          </Typography>
        </ModalContentWrapper>
        <ModalActions>
          <ThemeProvider theme={cherry}>
            <Button onClick={confirmRemoveUserHandler} color="primary">
              {t('modals.inviteUserModal.removeConfirmButton', { user: selectedMember?.display_name })}
            </Button>
          </ThemeProvider>
          <ThemeProvider theme={snow}>
            <Button onClick={() => setConfirmIsOpen(false)} className={classes.buttonMargin}>
              {t('common.cancel')}
            </Button>
          </ThemeProvider>
        </ModalActions>
      </Modal>
      <ErrorModal open={!!error} error={error!} onClose={() => setError(null)} />
    </Box>
  );
};
