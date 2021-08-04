import { Analytics } from '@analytics/Analytics';
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
    paddingTop: '70%',
    borderRadius: theme.shape.borderRadius,
  },
  avatarPreview: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
  },
}));

const trackDisplayNameAnalytics = (value: string) => {
  Analytics.trackEvent('profileSettings_displayName_changed', value);
};

const trackAvatarAnalytics = (value: string) => {
  Analytics.trackEvent('profileSettings_avatar_changed', value);
};

export function ProfileSettings() {
  const classes = useStyles();

  const localActor = useRoomStore((room) => room.cacheApi.getCurrentUser());

  const updateAvatar = (avatarName: string) => {
    client.participants.updateAvatarName(avatarName);
    trackAvatarAnalytics(avatarName);
  };

  if (!localActor) {
    return (
      <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  const avatarName = localActor.actor.avatarName || getAvatarFromUserId('brandedPatterns', localActor.actor.id);

  return (
    <Spacing maxHeight="100%" width="100%">
      <AvatarSelector value={avatarName} onChange={updateAvatar} className={classes.avatarGrid} />
      <Spacing flexDirection="column">
        <Box
          className={classes.avatarBox}
          style={{ backgroundColor: avatarOptions[avatarName].backgroundColor }}
          mb={1}
        >
          <Avatar className={classes.avatarPreview} name={avatarName} size={120} />
        </Box>
        <DisplayNameField onChange={trackDisplayNameAnalytics} />
      </Spacing>
    </Spacing>
  );
}
