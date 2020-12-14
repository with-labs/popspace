import * as React from 'react';
import { useSpeakingStates } from '../../hooks/useSpeakingStates/useSpeakingStates';
import { useLocalTracks } from '../LocalTracksProvider/useLocalTracks';
import { useLocalParticipant } from '../../hooks/useLocalParticipant/useLocalParticipant';
import { SoundMeter } from '../../utils/SoundMeter';
import throttle from 'lodash.throttle';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { RemoteParticipant, RemoteTrackPublication } from 'twilio-video';
import { logger } from '../../utils/logger';
import { RoomEvent } from '../../constants/twilio';
import { MediaReadinessContext } from '../MediaReadinessProvider/MediaReadinessProvider';

const UPDATE_INTERVAL = 300;
// arbitrary, based on experimentation...
// ostensibly it's a value from 0..1 representing percent
// volume input of the maximum volume possible from the device.
const SPEAKING_THRESHOLD = 0.001;

/**
 * A simple component that hooks into Twilio room state and
 * updates the speaking states provided by useSpeakingStates,
 * including monitoring local user's audio volume and broadcasting
 * to peers.
 */
export const SpeakingStateObserver: React.FC = () => {
  const localParticipant = useLocalParticipant();
  const localParticipantSid = localParticipant?.sid;

  const { audioTrack, dataTrack } = useLocalTracks();

  const { isReady } = React.useContext(MediaReadinessContext);

  // a single, stable instance of SoundMeter we can plug our
  // audio tracks into
  const [soundMeter] = React.useState(() => new SoundMeter());

  // this effect monitors local audio track volume
  React.useEffect(() => {
    const { set, remove } = useSpeakingStates.getState().api;

    if (!localParticipantSid || !isReady) return;

    if (!audioTrack) {
      remove(localParticipantSid);
    } else if (audioTrack) {
      soundMeter.connectToTrack(audioTrack.mediaStreamTrack);

      // we need to react to restart events, since the underlying
      // mediaStreamTrack changes
      function handleTrackRestart() {
        soundMeter.stop();
        soundMeter.connectToTrack(audioTrack!.mediaStreamTrack);
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
        localParticipantSid && set(localParticipantSid, isSpeaking);
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
  }, [audioTrack, localParticipantSid, soundMeter, dataTrack, isReady]);

  // this effect monitors peer data tracks for speaking events and
  // updates our local state
  const { room } = useVideoContext();
  React.useEffect(() => {
    const { set, remove } = useSpeakingStates.getState().api;

    const handleTrackMessage = (rawMessage: string, track: any, participant: RemoteParticipant) => {
      try {
        const parsed = JSON.parse(rawMessage);
        if (parsed.op === 'setIsSpeaking') {
          set(participant.sid, parsed.value);
        }
      } catch (err) {
        // nothing to do really, we just got a non-JSON message most likely.
        logger.debug(`Unrecognized data track message: ${rawMessage}`);
      }
    };

    const handleTrackDisconnect = (pub: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (pub.track?.kind === 'data') {
        remove(participant.sid);
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
