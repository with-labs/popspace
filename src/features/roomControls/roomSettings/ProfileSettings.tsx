import client from '@api/client';
import { useRoomStore } from '@api/useRoomStore';
import { Avatar } from '@components/Avatar/Avatar';
import { Spacing } from '@components/Spacing/Spacing';
import { avatarOptions, getAvatarFromUserId } from '@constants/AvatarMetadata';
import { AvatarSelector } from '@features/roomControls/profile/AvatarSelector';
import { Box, CircularProgress, makeStyles } from '@material-ui/core';

import { DisplayNameField } from '../profile/DisplayNameField';

const useStyles = makeStyles((theme) => ({
  avatarGrid: {
    flex: 1,
  },
  avatarBox: {
    position: 'relative',
    width: '100%',
    paddingTop: '80%',
    borderRadius: theme.shape.contentBorderRadius,
  },
  avatarPreview: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
  },
}));

export function ProfileSettings() {
  const classes = useStyles();

  const localActor = useRoomStore((room) => room.cacheApi.getCurrentUser());

  if (!localActor) {
    return (
      <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  const avatarName = localActor.actor.avatarName || getAvatarFromUserId('brandedPatterns', localActor.actor.id);

  return (
    <Spacing>
      <AvatarSelector
        value={avatarName}
        onChange={client.participants.updateAvatarName}
        className={classes.avatarGrid}
      />
      <Spacing flexDirection="column">
        <Box
          marginBottom="auto"
          className={classes.avatarBox}
          style={{ backgroundColor: avatarOptions[avatarName].backgroundColor }}
        >
          <Avatar className={classes.avatarPreview} name={avatarName} size={120} />
        </Box>
        <DisplayNameField />
      </Spacing>
    </Spacing>
  );
}
