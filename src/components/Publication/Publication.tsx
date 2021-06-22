import AudioTrack from '../AudioTrack/AudioTrack';
import VideoTrack from '../VideoTrack/VideoTrack';

import useTrack from '@providers/twilio/hooks/useTrack';
import { useLocalMediaGroup } from '@providers/media/useLocalMediaGroup';
import { IVideoTrack } from '../../types/twilio';
import { AudioTrack as IAudioTrack, LocalTrackPublication, RemoteTrackPublication } from 'twilio-video';
import { hasTrackName } from '@utils/trackNames';
import { CAMERA_TRACK_NAME } from '@constants/User';
import { useCanvasObject } from '@providers/canvas/CanvasObject';
import { Box } from '@material-ui/core';
import { VisibilityOff } from '@material-ui/icons';

interface PublicationProps {
  publication: LocalTrackPublication | RemoteTrackPublication;
  disableSpatialAudio?: boolean;
  isLocal: boolean;
  disableAudio?: boolean;
  classNames?: string;
  id?: string;
}

export default function Publication({
  publication,
  isLocal,
  disableAudio,
  classNames,
  id,
  disableSpatialAudio,
}: PublicationProps) {
  const track = useTrack(publication);

  // only publications which are from the same media group as the active user can be seen or heard
  const localMediaGroup = useLocalMediaGroup((store) => store.localMediaGroup);
  const { mediaGroup, objectId, objectKind } = useCanvasObject();
  const isAllowedToPlay = localMediaGroup === mediaGroup;

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
        <VideoTrack
          track={track as IVideoTrack}
          isLocal={hasTrackName(publication, CAMERA_TRACK_NAME) && isLocal}
          classNames={classNames}
          id={id}
        />
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
