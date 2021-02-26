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
  Divider,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { DeleteIcon } from '../../../../components/icons/DeleteIcon';
import { OptionsIcon } from '../../../../components/icons/OptionsIcon';
import { MemberListAvatar } from './MemberListAvatar';

import { Modal } from '../../../../components/Modal/Modal';
import { ModalActions } from '../../../../components/Modal/ModalActions';
import { ModalTitleBar } from '../../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../../components/Modal/ModalContentWrapper';

import { cherry, snow } from '../../../../theme/theme';
import Api from '../../../../utils/api';
import { toast } from 'react-hot-toast';
import { BaseResponse } from '../../../../utils/api';
import { ErrorCodes } from '../../../../constants/ErrorCodes';
import { logger } from '../../../../utils/logger';

import { DialogModal, DialogMessage } from '../../../../components/DialogModal/DialogModal';
import { getErrorMessageFromResponse } from '../../../../utils/ErrorMessage';

import { useIsRoomOwner } from '../../../../hooks/useIsRoomOwner/useIsRoomOwner';

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
  roomRoute: string;
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  memberList: {
    width: '100%',
  },
  deleteColor: {
    color: theme.palette.brandColors.cherry.bold,
  },
  deleteDisabledColor: {
    color: theme.palette.brandColors.cherry.light,
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
  cancelMembershipDisabledContents: {
    margin: 5,
  },
  cancelMembershipDisabledTooltip: {
    width: '172px',
    display: 'block',
  },
}));

export const MemberList: React.FC<IMemberListProps> = ({ members, onMemberRemove, roomRoute, className }) => {
  const classes = useStyles();
  const [error, setError] = useState<DialogMessage | null>(null);
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
  const isRoomOwner = useIsRoomOwner(roomRoute);

  const formatErrorMessage = (response: BaseResponse) => {
    return {
      title: t('common.error'),
      body: getErrorMessageFromResponse(response, t) ?? '',
    };
  };

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

  // we will use this... maybe... someday
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const inviteResendHandler = async () => {
    try {
      setMenuAnchorEl(null);
      setIsBusy(true);
      const result: BaseResponse = await Api.sendRoomInvite(roomRoute, selectedMember.email);
      if (result.success) {
        toast.success(t('modals.inviteUserModal.resendInviteSuccess') as string);
      } else {
        setError(formatErrorMessage(result));
      }
    } catch (err) {
      logger.error(`Error memberlist invite resend handler`, err);
      setError(
        formatErrorMessage({
          success: false,
          errorCode: ErrorCodes.UNEXPECTED,
        })
      );
    } finally {
      setIsBusy(false);
    }
  };

  const cancelInviteHandler = async () => {
    try {
      setMenuAnchorEl(null);
      setIsBusy(true);
      const result: BaseResponse = await Api.cancelRoomInvite(roomRoute, selectedMember.email);
      if (result.success) {
        onMemberRemove(selectedMember);
      } else {
        setError(formatErrorMessage(result));
      }
    } catch (err) {
      logger.error(`Error memberlist cancel invite handler`, err);
      setError(
        formatErrorMessage({
          success: false,
          errorCode: ErrorCodes.UNEXPECTED,
        })
      );
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
      const result: BaseResponse = await Api.removeRoomMember(roomRoute, selectedMember.email);
      if (result.success) {
        onMemberRemove(selectedMember);
      } else {
        setError(formatErrorMessage(result));
      }
    } catch (err) {
      logger.error(`Error memberlist remove handler`, err);
      setError(
        formatErrorMessage({
          success: false,
          errorCode: ErrorCodes.UNEXPECTED,
        })
      );
    } finally {
      setIsBusy(false);
    }
  };

  const renderRemoveMemberMenuItem = (isInviteAccepted: boolean) => {
    let text;
    let clickHandler;
    if (isInviteAccepted) {
      text = t('modals.inviteUserModal.removeUser');
      clickHandler = removeUserHandler;
    } else {
      text = t('modals.inviteUserModal.deleteInvite');
      clickHandler = cancelInviteHandler;
    }
    if (isRoomOwner) {
      return (
        <MenuItem onClick={clickHandler}>
          <>
            <ListItemIcon>
              <DeleteIcon className={classes.deleteColor} />
            </ListItemIcon>
            <ListItemText primary={text} className={classes.deleteColor} />
          </>
        </MenuItem>
      );
    } else {
      return (
        <Box>
          <ListItem>
            <ListItemIcon>
              <DeleteIcon className={classes.deleteDisabledColor} />
            </ListItemIcon>
            <ListItemText primary={text} className={classes.deleteDisabledColor} />
          </ListItem>
          <Box>
            <Divider />
            <Typography variant="caption" className={classes.cancelMembershipDisabledTooltip}>
              Only the room owner can remove members.
            </Typography>
          </Box>
        </Box>
      );
    }
  };

  return (
    <Box overflow="auto" className={className}>
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
                    <CircularProgress size={22} />
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
        {renderRemoveMemberMenuItem(selectedMember?.has_accepted)}
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
      <DialogModal message={error} onClose={() => setError(null)} />
    </Box>
  );
};
