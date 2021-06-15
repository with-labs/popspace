/**
 * #NOODLE_EDIT
 *
 * Adding in classNames param
 */

import React from 'react';
import AudioTrack from '../AudioTrack/AudioTrack';
import VideoTrack from '../VideoTrack/VideoTrack';

import useTrack from '@providers/twilio/hooks/useTrack';
import { useLocalMediaGroup } from '@providers/media/useLocalMediaGroup';
import { IVideoTrack } from '../../types/twilio';
import { AudioTrack as IAudioTrack, LocalTrackPublication, RemoteTrackPublication } from 'twilio-video';
import { hasTrackName } from '@utils/trackNames';
import { CAMERA_TRACK_NAME } from '@constants/User';

interface PublicationProps {
  publication: LocalTrackPublication | RemoteTrackPublication;
  /**
   * If this stream is associated with a particular room object,
   * like a widget or user, pass its ID to enable spatial audio.
   */
  objectId?: string | null;
  /**
   * For spatial audio, we must know what kind of object this is.
   * Default is widget.
   */
  objectKind?: 'widget' | 'user';
  disableSpatialAudio?: boolean;
  isLocal: boolean;
  disableAudio?: boolean;
  classNames?: string;
  id?: string;
  mediaGroup?: string | null;
}

export default function Publication({
  publication,
  objectId = null,
  isLocal,
  disableAudio,
  classNames,
  id,
  disableSpatialAudio,
  objectKind = 'widget',
  mediaGroup = null,
}: PublicationProps) {
  const track = useTrack(publication);

  // only publications which are from the same media group as the active user can be seen or heard
  const localMediaGroup = useLocalMediaGroup((store) => store.localMediaGroup);
  const isAllowedToPlay = localMediaGroup === mediaGroup;

  if (!track || !isAllowedToPlay) return null;

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
