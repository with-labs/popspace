import { Analytics } from '@analytics/Analytics';
import { BandwidthIcon } from '@components/icons/BandwidthIcon';
import { Spacing } from '@components/Spacing/Spacing';
import { CAMERA_TRACK_NAME } from '@constants/User';
import { Box, makeStyles } from '@material-ui/core';
import { VisibilityOff } from '@material-ui/icons';
import { useCanvasObject } from '@providers/canvas/CanvasObject';
import { useLocalMediaGroup } from '@providers/media/useLocalMediaGroup';
import useTrack from '@providers/twilio/hooks/useTrack';
import { hasTrackName } from '@utils/trackNames';
import clsx from 'clsx';
import { throttle } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AudioTrack as IAudioTrack, LocalTrackPublication, RemoteTrackPublication } from 'twilio-video';

import { IVideoTrack } from '../../types/twilio';
import AudioTrack from '../AudioTrack/AudioTrack';
import VideoTrack from '../VideoTrack/VideoTrack';

interface PublicationProps {
  publication: LocalTrackPublication | RemoteTrackPublication;
  disableSpatialAudio?: boolean;
  isLocal: boolean;
  disableAudio?: boolean;
  classNames?: string;
  id?: string;
}

// only track this event 1 time per 10 seconds
const trackBandwidthAnalytics = throttle(
  () => Analytics.trackEvent('Alert_lowbandwidth', new Date().toUTCString()),
  10 * 1000
);

const useStyles = makeStyles({
  videoContainer: {
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

export default function Publication({
  publication,
  isLocal,
  disableAudio,
  classNames,
  id,
  disableSpatialAudio,
}: PublicationProps) {
  const classes = useStyles();
  const track = useTrack(publication);

  // only publications which are from the same media group as the active user can be seen or heard
  const localMediaGroup = useLocalMediaGroup((store) => store.localMediaGroup);
  const { mediaGroup, objectId, objectKind } = useCanvasObject();
  const isAllowedToPlay = localMediaGroup === mediaGroup;
  const [isSwitchedOff, setIsSwitchedOff] = React.useState(false);

  React.useEffect(() => {
    const handleSwitchedOff = () => {
      setIsSwitchedOff(true);
      trackBandwidthAnalytics();
    };

    const handleSwitchedOn = () => setIsSwitchedOff(false);

    track?.on('switchedOff', handleSwitchedOff);
    track?.on('switchedOn', handleSwitchedOn);

    return () => {
      track?.off('switchedOff', handleSwitchedOff);
      track?.off('switchedOn', handleSwitchedOn);
    };
  }, [track, setIsSwitchedOff]);

  if (!track) {
    return null;
  }

  if (!isAllowedToPlay) {
    switch (track.kind) {
      case 'video':
        return (
          <Box
            className={classNames}
            bgcolor="grey.50"
            p={0.5}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <VisibilityOff style={{ width: '40%', height: '40%', opacity: 0.5 }} />
          </Box>
        );
      default:
        return null;
    }
  }

  switch (track.kind) {
    case 'video':
      return (
        <div className={clsx(classes.videoContainer, classNames)}>
          <VideoTrack
            track={track as IVideoTrack}
            isLocal={hasTrackName(publication, CAMERA_TRACK_NAME) && isLocal}
            id={id}
            classNames={classes.video}
          />
          {isSwitchedOff && <UnstableOverlay />}
        </div>
      );
    case 'audio':
      return disableAudio ? null : (
        <AudioTrack
          track={track as IAudioTrack}
          objectKind={objectKind}
          objectId={objectId}
          disableSpatialAudio={disableSpatialAudio}
          id={id}
        />
      );
    default:
      return null;
  }
}

const useUnstableOverlayStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    bottom: theme.spacing(0.5),
    right: theme.spacing(0.5),
    zIndex: 1,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    fontSize: theme.typography.pxToRem(14),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '90%',
    overflow: 'hidden',
  },
}));
const UnstableOverlay = ({ small }: { small?: boolean }) => {
  const { t } = useTranslation();

  const classes = useUnstableOverlayStyles();
  return (
    <Spacing className={classes.root} flexDirection="row" alignItems="center" p={0.5}>
      <BandwidthIcon fontSize="inherit" />
      {!small && (
        <span
          style={{ marginLeft: 4, overflow: 'hidden', textOverflow: 'inherit' }}
          title={t('error.twilioFailure.lowBandwidth')}
        >
          {t('error.twilioFailure.lowBandwidth')}
        </span>
      )}
    </Spacing>
  );
};
