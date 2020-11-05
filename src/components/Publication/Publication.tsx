/**
 * #WITH_EDIT
 *
 * Adding in classNames param
 */

import React from 'react';
import AudioTrack from '../AudioTrack/AudioTrack';
import VideoTrack from '../VideoTrack/VideoTrack';

import useTrack from '../../hooks/useTrack/useTrack';

import { IVideoTrack } from '../../types/twilio';
import { AudioTrack as IAudioTrack, LocalTrackPublication, RemoteTrackPublication, Track } from 'twilio-video';
import { useSpatialAudioVolume } from '../../hooks/useSpatialAudioVolume/useSpatialAudioVolume';

interface PublicationProps {
  publication: LocalTrackPublication | RemoteTrackPublication;
  /**
   * If this stream is associated with a particular room object,
   * like a widget or user, pass its ID to enable spatial audio.
   */
  objectId?: string;
  disableSpatialAudio?: boolean;
  isLocal: boolean;
  disableAudio?: boolean;
  videoPriority?: Track.Priority;
  classNames?: string;
  id?: string;
}

export default function Publication({
  publication,
  objectId,
  isLocal,
  disableAudio,
  videoPriority,
  classNames,
  id,
  disableSpatialAudio,
}: PublicationProps) {
  const track = useTrack(publication);

  const volume = useSpatialAudioVolume(objectId);

  if (!track) return null;

  switch (track.kind) {
    case 'video':
      return (
        <VideoTrack
          track={track as IVideoTrack}
          priority={videoPriority}
          isLocal={track.name.startsWith('camera') && isLocal}
          classNames={classNames}
          id={id}
        />
      );
    case 'audio':
      return disableAudio ? null : (
        <AudioTrack track={track as IAudioTrack} volume={disableSpatialAudio ? 1 : volume} id={id} />
      );
    default:
      return null;
  }
}
