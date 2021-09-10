/**
 * #NOODLE_EDIT
 *
 * Adding in classNames param
 */
import { styled } from '@material-ui/core/styles';
import React, { useEffect, useRef } from 'react';
import { Track } from 'twilio-video';

import { IVideoTrack } from '../../types/twilio';

const Video = styled('video')({
  width: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
});

interface VideoTrackProps {
  track: IVideoTrack;
  isLocal?: boolean;
  priority?: Track.Priority;
  classNames?: string;
  id?: string;
  style?: React.CSSProperties;
}

export default function VideoTrack({
  track,
  isLocal,
  priority,
  classNames,
  id,
  style: providedStyle = {},
}: VideoTrackProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.muted = true;
    if (track.setPriority && priority) {
      track.setPriority(priority);
    }
    track.attach(el);
    return () => {
      track.detach(el);
      if (track.setPriority && priority) {
        // Passing `null` to setPriority will set the track's priority to that which it was published with.
        track.setPriority(null);
      }
    };
  }, [track, priority]);

  // The local video track is mirrored.
  const style = isLocal ? { transform: 'rotateY(180deg)', ...providedStyle } : providedStyle;

  return <Video ref={ref} style={style} className={classNames} id={id} />;
}
