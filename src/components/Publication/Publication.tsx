/**
 * #WITH_EDIT
 *
 * Adding in classNames param
 */

import React from 'react';
import AudioTrack from '../AudioTrack/AudioTrack';
import VideoTrack from '../VideoTrack/VideoTrack';

import useTrack from '../../hooks/useTrack/useTrack';
import { useParticipantLocationDelta } from '../../withHooks/useParticipantLocationDelta/useParticipantLocationDelta';

import { IVideoTrack } from '../../types/twilio';
import {
  AudioTrack as IAudioTrack,
  LocalTrackPublication,
  Participant,
  RemoteTrackPublication,
  Track,
} from 'twilio-video';
import { useSelector } from 'react-redux';
import { selectors } from '../../features/room/roomSlice';

interface PublicationProps {
  publication: LocalTrackPublication | RemoteTrackPublication;
  participant: Participant;
  isLocal: boolean;
  disableAudio?: boolean;
  videoPriority?: Track.Priority;
  classNames?: string;
}

/**
 * Measured in room world space units - pixels at 100% zoom
 */
const MAX_RANGE = 1000;

export default function Publication({
  publication,
  participant,
  isLocal,
  disableAudio,
  videoPriority,
  classNames,
}: PublicationProps) {
  const track = useTrack(publication);
  const distance = useParticipantLocationDelta(participant);
  const useSpatialAudio = useSelector(selectors.selectUseSpatialAudio);

  // The math for calculating the volume of a participant
  // is based on positioning of elements from top, left with a relative
  // range from 0 - 1, then multiplied by the screen width and height. There is
  // an assumption that all values for top and left are between 0 and 1.
  // However, there can be top and left values outside of that range, by dragging
  // and dropping a participant partially "off screen." Those scenarios cause
  // issues with the math needed to create the volume curves. So, I'm forcing
  // the valued between 0 and 1, via Math.min and Math.max
  const dist = Math.max(Math.min(distance, MAX_RANGE), 0) / MAX_RANGE;

  // The below limits and calculation derived from cosine curve, linked here
  // https://www.desmos.com/calculator/jobehh1xex
  let volume;

  // If spatial audio is turned off for the room, volume is always max
  if (!useSpatialAudio) {
    volume = 1;
    // if localParticipant is in a huddle with participant, participant volume should be max
  } else if (dist > 0.69) {
    volume = 0;
    // If distance reaches the peak or higher of the cosine curve, volume is max
  } else if (dist < 0.167) {
    volume = 1;
    // If 'else' block reached, calculate volume based on cosine curve
  } else {
    // The equation used here is arbitrary. It was selected because the curve
    // it produces matches the design team's desire for how user's experince
    // audio in the space of the room. Look at the link above to see the
    // curve generated (desmos.com link).
    volume = Math.cos(6 * dist - 1) / 2 + 0.5;
  }

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
