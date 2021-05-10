import React, { useEffect, useState, useCallback } from 'react';
import { makeStyles, Box, Typography, TextField, Button, Hidden } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import patternBg from '../../../images/illustrations/pattern_bg_1.svg';
import { Spacing } from '../../../components/Spacing/Spacing';
import { AvatarSelectorBubble } from '../../../features/roomControls/avatar/AvatarSelectorBubble';

import { CameraToggle } from '../../../features/roomControls/media/CameraToggle';
import { MicToggle } from '../../../features/roomControls/media/MicToggle';

import useLocalVideoToggle from '../../../providers/media/hooks/useLocalVideoToggle';
import useLocalAudioToggle from '../../../providers/media/hooks/useLocalAudioToggle';
import { RoomList } from '../RoomList/RoomList';
import { ApiNamedRoom, ApiParticipantState } from '../../../utils/api';

import { useIsRoomOwner } from '../../../hooks/useIsRoomOwner/useIsRoomOwner';
import { useCurrentUserProfile } from '../../../hooks/api/useCurrentUserProfile';
import Api from '../../../utils/api';
import { useHistory } from 'react-router-dom';

import useQueryParams from '../../../hooks/useQueryParams/useQueryParams';
import { DialogModal, DialogMessage } from '../../../components/DialogModal/DialogModal';
import { ErrorCodes } from '../../../constants/ErrorCodes';
import { Header } from '../../../components/Header/Header';
import { getErrorMessageFromResponse, getErrorDialogText } from '../../../utils/ErrorMessage';
import { logger } from '../../../utils/logger';
import { useRoomRoute } from '../../../hooks/useRoomRoute/useRoomRoute';
import { randomSectionAvatar } from '../../../constants/AvatarMetadata';

export interface IEntryViewProps {
  rooms: ApiNamedRoom[];
  onComplete: () => void;
}

const emptyRoomInfo = {
  room_id: '',
  owner_id: '',
  preview_image_url: '',
  display_name: '',
  route: '',
  url_id: '',
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '100vh',
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',

    [theme.breakpoints.up('md')]: {
      height: '100vh',
    },
  },
  contentWrapper: {
    width: '100%',
    alignSelf: 'center',
    height: '100%',
    display: 'grid',
    gridTemplateAreas: '"content list"',
    gridTemplateColumns: 'minmax(auto, 500px) 1fr',
    gridGap: theme.spacing(4),
    overflow: 'hidden',

    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    paddingRight: theme.spacing(4),
    paddingTop: theme.spacing(7.5),
    paddingBottom: theme.spacing(7.5),
    paddingLeft: theme.spacing(7.5),
    overflow: 'auto',
    gridArea: 'content',

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
      overflow: 'visible',
      width: '100%',
      justifySelf: 'center',
      paddingBottom: '100px',
      justifyContent: 'center',
    },
  },
  list: {
    gridArea: 'list',
    overflow: 'auto',
    backgroundColor: theme.palette.brandColors.sand.regular,
  },
  background: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 32,
    width: '100%',
    backgroundColor: theme.palette.brandColors.mandarin.light,
    backgroundImage: `url(${patternBg})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
  avatarButton: {
    border: 'none',
    background: 'none',
    marginTop: theme.spacing(6),
    left: '50%',
    transform: 'translateX(-50%)',
    cursor: 'pointer',
  },
  nameField: {
    position: 'relative',
    zIndex: 1,
  },
  openRoomListButton: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '& .MuiButton-label	': {
      justifyContent: 'start',
    },
  },
  imgWrapper: {
    width: 48,
    height: 48,
    paddingRight: theme.spacing(1),
  },
  owner: {
    color: theme.palette.brandColors.oregano.bold,
  },
  guest: {
    color: theme.palette.brandColors.slate.bold,
  },
  displayTitle: {
    fontWeight: 'bold',
  },
}));

export const EntryView: React.FC<IEntryViewProps> = ({ rooms, onComplete }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const [isVideoOn, toggleVideoOn, isVideoBusy] = useLocalVideoToggle();
  const [isMicOn, doMicToggle, isAudioBusy] = useLocalAudioToggle();
  const { profile, update, user } = useCurrentUserProfile();
  const [isRoomListOpen, setIsRoomListOpen] = useState(false);
  const participantState = profile?.participantState;

  const defaultDisplayName = participantState?.display_name ?? profile?.user.display_name;
  const [name, setName] = React.useState(defaultDisplayName ?? '');

  const currentRoomRoute = useRoomRoute();
  const isOwner = useIsRoomOwner(currentRoomRoute);

  const initalRoom = rooms.find((room) => room.route === currentRoomRoute);

  const [roomInfo, setRoomInfo] = useState<ApiNamedRoom>(initalRoom || emptyRoomInfo);

  const avatar = participantState?.avatar_name;

  // check to see if we have url error code and set it as the default error if we have it
  const query = useQueryParams();
  const errorInfo = query.get('e');
  const [errorMsg, setErrorMsg] = React.useState<DialogMessage | null>(getErrorDialogText(errorInfo as ErrorCodes, t));

  const updateProfile = useCallback(
    async (newProfileData: { [key: string]: any }) => {
      try {
        const newProfile = { ...participantState, ...newProfileData } as ApiParticipantState;
        const response = await Api.setParticipantState(newProfile);

        if (response.success) {
          // update the query cache
          update((data) => {
            if (!data || !data.profile) return {};
            data.profile.participantState = newProfile;
            return data;
          });
        } else {
          // TODO: update this to reflect the error message we get from the api
          setErrorMsg({
            title: t('common.error'),
            body: response.message ?? '',
          } as DialogMessage);
          logger.error('Error updating user participant profile', response);
        }
      } catch (err) {
        setErrorMsg({
          title: t('common.error'),
          body: getErrorMessageFromResponse(err, t) ?? '',
        } as DialogMessage);
        // unexpected error happened
        logger.error('Unexpected Error updating user participant profile', err);
      }
    },
    [participantState, t, update]
  );

  useEffect(() => {
    // if the user doesnt have an avatar set (ie: first time log in)
    // we will pick a random brand avatar and then save it off
    async function initalizeUserAvatar() {
      if (!avatar) {
        const newAvatar = randomSectionAvatar('brandedPatterns');
        await updateProfile({ avatar_name: newAvatar });
      }
    }

    initalizeUserAvatar();
  }, [avatar, updateProfile]);

  const handleComplete = () => {
    if (name !== participantState?.display_name) {
      updateProfile({
        display_name: name,
      });
    }
    onComplete();
  };

  const clearUrlError = () => {
    if (errorInfo) {
      const searchParams = new URLSearchParams(history.location.search);
      searchParams.delete('e');
      // remove the error from the query string when the user has cleared
      // the error
      history.replace({
        pathname: history.location.pathname,
        search: searchParams.toString(),
      });
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <main className={classes.root}>
      <div className={classes.contentWrapper}>
        <div className={classes.content}>
          <Box minHeight="100%" display="flex" flexDirection="column" height="100%">
            <Header isFullLength={true} userName={user ? user['first_name'] : ''} />
            <Box display="flex" flexDirection="column" flex={1}>
              <Box position="relative" marginBottom={0.5}>
                <div className={classes.background} />
                <AvatarSelectorBubble
                  className={classes.avatarButton}
                  userData={{
                    userId: profile.user.id,
                    displayName: participantState?.display_name || '',
                    avatarName: participantState?.avatar_name || '',
                  }}
                  updateSelf={updateProfile}
                  showVideo
                />
              </Box>
              <TextField
                placeholder={t('pages.preroom.namePlaceholder')}
                required
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                className={classes.nameField}
              />
              <Spacing style={{ alignSelf: 'center', marginTop: 8 }} alignItems="center">
                <CameraToggle isVideoOn={isVideoOn} toggleVideoOn={toggleVideoOn} busy={isVideoBusy} />
                <MicToggle isMicOn={isMicOn} doMicToggle={doMicToggle} busy={isAudioBusy} />
              </Spacing>
            </Box>
            <Hidden mdUp>
              <Box
                component={Button}
                onClick={() => setIsRoomListOpen(true)}
                className={classes.openRoomListButton}
                display="flex"
                flexDirection="row"
                width="100%"
                alignItems="center"
              >
                <img className={classes.imgWrapper} src={roomInfo.preview_image_url} alt="" />
                <Box display="flex" flexDirection="column" alignItems="start">
                  <Typography variant="body1" className={classes.displayTitle}>
                    {roomInfo.display_name}
                  </Typography>
                  <Box className={isOwner ? classes.owner : classes.guest}>
                    <Typography variant="h4">
                      {isOwner ? t('pages.preroom.roomSummary.owner') : t('pages.preroom.roomSummary.guest')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Hidden>
            <Hidden smDown>
              <Typography paragraph>{t('pages.preroom.setupExplanation')}</Typography>
            </Hidden>
            <Button onClick={handleComplete} disabled={!name}>
              {t('pages.preroom.enterRoomButton', { roomName: roomInfo.display_name })}
            </Button>
          </Box>
        </div>
        <Box display="flex" justifyContent="center" className={classes.list}>
          <RoomList
            rooms={rooms}
            isOpen={isRoomListOpen}
            onClose={() => setIsRoomListOpen(false)}
            onError={(msg: DialogMessage) => setErrorMsg(msg)}
            onRoomSelected={setRoomInfo}
            onComplete={handleComplete}
          />
        </Box>
      </div>
      <DialogModal message={errorMsg} onClose={clearUrlError}></DialogModal>
    </main>
  );
};
