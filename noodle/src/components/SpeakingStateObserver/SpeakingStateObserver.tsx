import { RoomEvent } from '@constants/twilio';
import { useSpeakingStates } from '@hooks/useSpeakingStates/useSpeakingStates';
import { useLocalTracks } from '@providers/media/hooks/useLocalTracks';
import { useMediaReadiness } from '@providers/media/useMediaReadiness';
import { useLocalParticipant } from '@providers/twilio/hooks/useLocalParticipant';
import { useTwilio } from '@providers/twilio/TwilioProvider';
import { logger } from '@utils/logger';
import { SoundMeter } from '@utils/SoundMeter';
import throttle from 'lodash.throttle';
import * as React from 'react';
import { RemoteParticipant, RemoteTrackPublication } from 'twilio-video';

const UPDATE_INTERVAL = 300;
// arbitrary, based on experimentation...
// ostensibly it's a value from 0..1 representing percent
// volume input of the maximum volume possible from the device.
const SPEAKING_THRESHOLD = 0.002;

/**
 * A simple component that hooks into Twilio room state and
 * updates the speaking states provided by useSpeakingStates,
 * including monitoring local user's audio volume and broadcasting
 * to peers.
 */
export const SpeakingStateObserver: React.FC = () => {
  const localParticipantIdentity = useLocalParticipant()?.identity;

  const { audioTrack, dataTrack } = useLocalTracks();

  const isReady = useMediaReadiness((s) => s.isReady);

  // a single, stable instance of SoundMeter we can plug our
  // audio tracks into
  const soundMeterRef = React.useRef<SoundMeter | null>(null);

  // this effect monitors local audio track volume
  React.useEffect(() => {
    const { set, remove } = useSpeakingStates.getState().api;

    if (!localParticipantIdentity || !isReady) return;

    if (!audioTrack) {
      remove(localParticipantIdentity);
    } else if (audioTrack) {
      const soundMeter = soundMeterRef.current ?? new SoundMeter();
      soundMeterRef.current = soundMeter;

      soundMeter.connectToTrack(audioTrack.mediaStreamTrack);

      // we need to react to restart events, since the underlying
      // mediaStreamTrack changes
      function handleTrackRestart() {
        if (!audioTrack) return;
        soundMeter.stop();
        soundMeter.connectToTrack(audioTrack.mediaStreamTrack);
      }
      audioTrack.on('restarted', handleTrackRestart);

      // begin polling isSpeaking state
      let isSpeaking = false;

      const updateIsSpeakingState = throttle((value: boolean) => {
        // update peers
        dataTrack.send(
          JSON.stringify({
            op: 'setIsSpeaking',
            value,
          })
        );
        // update local view
        localParticipantIdentity && set(localParticipantIdentity, isSpeaking);
      }, UPDATE_INTERVAL);

      let frame: number = 0;
      function loop() {
        frame = requestAnimationFrame(loop);

        const isNowSpeaking = soundMeter.volume > SPEAKING_THRESHOLD;
        if (isNowSpeaking !== isSpeaking) {
          isSpeaking = isNowSpeaking;
          updateIsSpeakingState(isSpeaking);
        }
      }
      loop();

      return () => {
        cancelAnimationFrame(frame);
        soundMeter.stop();
        audioTrack.off('restarted', handleTrackRestart);
      };
    }
  }, [audioTrack, localParticipantIdentity, dataTrack, isReady]);

  // this effect monitors peer data tracks for speaking events and
  // updates our local state
  const { room } = useTwilio();
  React.useEffect(() => {
    const { set, remove } = useSpeakingStates.getState().api;

    const handleTrackMessage = (rawMessage: string | ArrayBuffer, track: any, participant: RemoteParticipant) => {
      try {
        const parsed = JSON.parse(rawMessage.toString());
        if (parsed.op === 'setIsSpeaking') {
          set(participant.identity, parsed.value);
        }
      } catch (err) {
        // nothing to do really, we just got a non-JSON message most likely.
        logger.debug(`Unrecognized data track message: ${rawMessage}`);
      }
    };

    const handleTrackDisconnect = (pub: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (pub.track?.kind === 'data') {
        remove(participant.identity);
      }
    };

    room?.on(RoomEvent.TrackMessage, handleTrackMessage);
    room?.on(RoomEvent.TrackUnpublished, handleTrackDisconnect);

    return () => {
      room?.off(RoomEvent.TrackMessage, handleTrackMessage);
      room?.off(RoomEvent.TrackUnpublished, handleTrackDisconnect);
    };
  }, [room]);

  return null;
};
