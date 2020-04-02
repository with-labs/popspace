/**
 * #ANGLES_EDIT
 *
 * Adding in classNames param
 */


import React from 'react';
import useTrack from '../../hooks/useTrack/useTrack';
import AudioTrack from '../AudioTrack/AudioTrack';
import VideoTrack from '../VideoTrack/VideoTrack';

import { IVideoTrack } from '../../types';
import {
  AudioTrack as IAudioTrack,
  LocalTrackPublication,
  Participant,
  RemoteTrackPublication,
  Track,
} from 'twilio-video';

interface PublicationProps {
  publication: LocalTrackPublication | RemoteTrackPublication;
  participant: Participant;
  isLocal: boolean;
  disableAudio?: boolean;
  videoPriority?: Track.Priority;
  classNames?: string
}

export default function Publication({ publication, isLocal, disableAudio, videoPriority, classNames }: PublicationProps) {
  const track = useTrack(publication);

  if (!track) return null;

  switch (track.kind) {
    case 'video':
      return (
        <VideoTrack
          track={track as IVideoTrack}
          priority={videoPriority}
          isLocal={track.name === 'camera' && isLocal}
          classNames={ classNames }
        />
      );
    case 'audio':
      return disableAudio ? null : <AudioTrack track={track as IAudioTrack} />;
    default:
      return null;
  }
}
