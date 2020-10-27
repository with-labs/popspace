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
  Avatar,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { DeleteIcon } from '../../../../../components/icons/DeleteIcon';
import { EmailIcon } from '../../../../../components/icons/EmailIcon';
import { OptionsIcon } from '../../../../../components/icons/OptionsIcon';

interface IMemberListProps {
  members: any[];
}

const useStyles = makeStyles((theme) => ({
  memberList: {
    width: '100%',
  },
}));

export const MemberList: React.FC<IMemberListProps> = ({ members }) => {
  const classes = useStyles();
  const [menuAchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  //TODO: update types
  const [selectedMember, setSelectedMember] = useState<null | any>();
  const { t } = useTranslation();

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

  const inviteResendHandler = () => {
    setMenuAnchorEl(null);
  };

  const cancelInviteHandler = () => {
    setMenuAnchorEl(null);
  };

  const removeUserHandler = () => {
    setMenuAnchorEl(null);
  };

  return (
    <Box overflow="auto">
      <List className={classes.memberList}>
        {members.map((member, index) => {
          return (
            <ListItem key={member.email}>
              <ListItemAvatar>
                <Avatar></Avatar>
              </ListItemAvatar>
              <ListItemText primary={member.display_name} secondary={member.email} />
              <ListItemSecondaryAction>
                <div>
                  <IconButton edge="end" aria-label="member_options" onClick={(e) => onMenuOpenHandler(e, index)}>
                    <OptionsIcon />
                  </IconButton>
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
        {selectedMember?.accepted ? (
          <>
            <MenuItem onClick={removeUserHandler}>
              <ListItemIcon>
                <DeleteIcon color="error" />
              </ListItemIcon>
              <Typography color="error">{t('modals.inviteUserModal.removeUser')}</Typography>
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={inviteResendHandler}>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <Typography>{t('modals.inviteUserModal.resendInvite')}</Typography>
            </MenuItem>
            <MenuItem onClick={cancelInviteHandler}>
              <ListItemIcon>
                <DeleteIcon color="error" />
              </ListItemIcon>
              <Typography color="error">{t('modals.inviteUserModal.deleteInvite')}</Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};
