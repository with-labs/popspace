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
import {
  AudioTrack as IAudioTrack,
  LocalTrackPublication,
  Participant,
  RemoteTrackPublication,
  Track,
} from 'twilio-video';
import { useSpatialAudioVolume } from '../../hooks/useSpatialAudioVolume/useSpatialAudioVolume';

interface PublicationProps {
  publication: LocalTrackPublication | RemoteTrackPublication;
  participant: Participant;
  isLocal: boolean;
  disableAudio?: boolean;
  videoPriority?: Track.Priority;
  classNames?: string;
}

export default function Publication({
  publication,
  participant,
  isLocal,
  disableAudio,
  videoPriority,
  classNames,
}: PublicationProps) {
  const track = useTrack(publication);

  const volume = useSpatialAudioVolume(participant.sid);

  if (!track) return null;

  switch (track.kind) {
    case 'video':
      return (
        <VideoTrack
          track={track as IVideoTrack}
          priority={videoPriority}
          isLocal={track.name.startsWith('camera') && isLocal}
          classNames={classNames}
        />
      );
    case 'audio':
      return disableAudio ? null : <AudioTrack track={track as IAudioTrack} volume={volume} />;
    default:
      return null;
  }
}
