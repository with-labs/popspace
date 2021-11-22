import { Analytics } from '@analytics/Analytics';
import client from '@api/client';
import { useRoomStore } from '@api/useRoomStore';
import { Avatar } from '@components/Avatar/Avatar';
import { AvatarAnimationState } from '@components/Avatar/AvatarAnimator';
import { useAvatarBackgroundColor } from '@components/Avatar/useAvatarBackgroundColor';
import { Spacing } from '@components/Spacing/Spacing';
import { getAvatarFromUserId } from '@constants/AvatarMetadata';
import { Box, makeStyles } from '@material-ui/core';

import { AvatarGrid } from '../profile/AvatarGrid';
import { DisplayNameField } from '../profile/DisplayNameField';

const useStyles = makeStyles((theme) => ({
  avatarWrapper: {
    '&::-webkit-scrollbar-track': {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4),
    },
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

  const avatarName = localActor?.actor.avatarName || getAvatarFromUserId(localActor?.actor.id ?? '0');
  const backgroundColor = useAvatarBackgroundColor(avatarName);

  return (
    <Box display="flex" maxHeight="100%" width="100%">
      <Box flex="3 0 0" overflow="auto" py={4} className={classes.avatarWrapper}>
        <AvatarGrid value={avatarName} onChange={updateAvatar} loading={!localActor} />
      </Box>
      <Spacing flexDirection="column" p={4} pl={3} flex="1 0 0">
        <Box className={classes.avatarBox} style={{ backgroundColor }} mb={1}>
          <Avatar
            className={classes.avatarPreview}
            name={avatarName}
            size={120}
            animation={AvatarAnimationState.Talking}
          />
        </Box>
        <DisplayNameField onChange={trackDisplayNameAnalytics} />
      </Spacing>
    </Box>
  );
}
