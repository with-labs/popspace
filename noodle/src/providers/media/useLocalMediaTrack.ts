import { MediaTrackEvent } from '@constants/twilio';
import { logger } from '@utils/logger';
import { createTrackName } from '@utils/trackNames';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createLocalAudioTrack, createLocalVideoTrack, LocalAudioTrack, LocalVideoTrack } from 'twilio-video';

import { MEDIA_TYPES } from '../../errors/MediaError';
import { convertMediaError } from './convertMediaError';

function getTrackDeviceId(track: LocalAudioTrack | LocalVideoTrack) {
  const constraints = track.mediaStreamTrack.getConstraints();
  // FireFox reports an empty object for nonexistent device ID, which isn't falsy, so using
  // a more advanced check.
  if (isEmpty(constraints.deviceId)) {
    return null;
  }
  return constraints.deviceId;
}

export type LocalMediaOptions = {
  onError?: (err: Error) => void;
  permissionDeniedMessage?: string;
  permissionDismissedMessage?: string;
};

/**
 * The objective of this hook is to provide a self-contained state system
 * for managing the existence of the user's media tracks. It provides
 * an API which includes:
 * - The track, stateful: will re-render when track existence or identity changes
 * - A Start method to either begin or restart the track
 * - A Stop method to stop and remove the track
 */
export function useLocalMediaTrack(
  kind: 'video' | 'audio',
  name: string,
  deviceId: string | null,
  constraints: MediaTrackConstraints,
  { onError, permissionDeniedMessage, permissionDismissedMessage }: LocalMediaOptions
) {
  const { t } = useTranslation();
  // capture this to avoid re-rendering on changes.
  const constraintsRef = useRef(constraints);
  const [track, setTrack] = useState<LocalAudioTrack | LocalVideoTrack | null>(null);

  const isRestartingRef = useRef(false);

  const start = useCallback(async () => {
    const finalConstraints = {
      ...constraintsRef.current,
      deviceId: deviceId ?? undefined,
      // name is randomized to prevent publish conflicts down the line
      name: createTrackName(name),
    };

    try {
      if (track) {
        // we track restarting state in realtime with a ref - because
        // restart fires the 'stopped' event, but we don't want to trigger
        // normal track-stopped behavior.
        isRestartingRef.current = true;
        logger.debug(`Restarting media track ${name} (new trackName: ${finalConstraints.name})`);
        track.stop();
        const createTrack = kind === 'video' ? createLocalVideoTrack : createLocalAudioTrack;
        const newTrack = await createTrack(finalConstraints);
        setTrack(newTrack);
        // this isn't a native event, but it's really useful to differentiate
        // a restart vs. a stop / start.
        track.emit('restarted');
        isRestartingRef.current = false;
      } else {
        logger.debug(`Starting media track ${name} (trackName: ${finalConstraints.name})`);
        const createTrack = kind === 'video' ? createLocalVideoTrack : createLocalAudioTrack;
        const newTrack = await createTrack(finalConstraints);
        setTrack(newTrack);
      }
    } catch (err: any) {
      const mediaType = kind === 'audio' ? MEDIA_TYPES.AUDIO : MEDIA_TYPES.VIDEO;
      onError?.(
        convertMediaError(
          err,
          mediaType,
          t('error.media.noSystemPermissionsError'),
          permissionDeniedMessage,
          permissionDismissedMessage
        )
      );
    }
  }, [onError, kind, permissionDeniedMessage, permissionDismissedMessage, deviceId, track, name, t]);

  const stop = useCallback(() => {
    track?.stop();
    setTrack(null);
  }, [track]);

  const mute = useCallback(() => {
    track?.disable();
  }, [track]);

  const unMute = useCallback(() => {
    track?.enable();
  }, [track]);

  // subscribe to track ending, and remove it.
  useEffect(() => {
    const handleStopped = () => {
      // the track stopped, so we clear it in state - UNLESS
      // we are in the process of restarting it, which still fires the
      // stopped event
      if (!isRestartingRef.current) setTrack(null);
    };
    track?.on(MediaTrackEvent.Stopped, handleStopped);
    return () => {
      track?.off(MediaTrackEvent.Stopped, handleStopped);
    };
  }, [track]);

  // restart on device ID change
  useEffect(() => {
    if (!!track && getTrackDeviceId(track) !== deviceId) {
      start();
    }
  }, [deviceId, track, start]);

  return [track, { start, restart: start, stop, mute, unMute }] as const;
}
