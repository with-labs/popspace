import { styled } from '@material-ui/core/styles';
import { attachTrack } from '@src/media/attachTrack';
import React, { CSSProperties, useEffect, useRef } from 'react';

const Video = styled('video')({
  width: '100%',
  maxHeight: '100%',
});

interface VideoTrackProps {
  track: MediaStreamTrack | null;
  isLocal?: boolean;
  classNames?: string;
  id?: string;
  style?: CSSProperties;
}

export default function VideoTrack({ track, isLocal, style: providedStyle, classNames, id }: VideoTrackProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !track) {
      return;
    }
    return attachTrack(el, track);
  }, [track]);

  const isFrontFacing = track?.getSettings().facingMode !== 'environment';
  const style: CSSProperties = {
    ...providedStyle,
    transform: isLocal && isFrontFacing ? 'rotateY(180deg)' : '',
  };

  return <Video ref={videoRef} style={style} className={classNames} id={id} />;
}
