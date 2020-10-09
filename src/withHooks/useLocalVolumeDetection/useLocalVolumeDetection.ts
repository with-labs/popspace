/**
 * Adapted from https://github.com/twilio/twilio-video-app-react/blob/master/src/components/AudioLevelIndicator/AudioLevelIndicator.tsx
 *
 * Basically removed the component portiion of that file and called redux actions instead in the interval that
 * samples the audio levels.
 */

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { LocalAudioTrack, RemoteAudioTrack } from 'twilio-video';
import { actions, selectors } from '../../features/room/roomSlice';
import useIsTrackEnabled from '../../hooks/useIsTrackEnabled/useIsTrackEnabled';
import useMediaStreamTrack from '../../hooks/useMediaStreamTrack/useMediaStreamTrack';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useCoordinatedDispatch } from '../../features/room/CoordinatedDispatchProvider';

// @ts-ignore TS doesn't think `webkitAudioContext` exists, but it might in certain browsers.
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext: AudioContext;

export function initializeAnalyser(stream: MediaStream) {
  audioContext = audioContext || new AudioContext();
  const audioSource = audioContext.createMediaStreamSource(stream);

  const analyser = audioContext.createAnalyser();
  analyser.smoothingTimeConstant = 0.4;
  analyser.fftSize = 512;

  audioSource.connect(analyser);
  return analyser;
}

export function useLocalVolumeDetection() {
  const {
    room: { localParticipant },
    localTracks,
  } = useVideoContext();
  const isSpeaking = useSelector(selectors.createPersonIsSpeakingSelector(localParticipant.sid));

  const coordinatedDispatch = useCoordinatedDispatch();
  const updateIsSpeaking = useCallback(
    (newIsSpeaking: boolean) => {
      coordinatedDispatch(
        actions.updatePersonIsSpeaking({
          id: localParticipant.sid,
          isSpeaking: newIsSpeaking,
        })
      );
    },
    [coordinatedDispatch, localParticipant.sid]
  );
  const audioTrack = localTracks.find((track) => track.kind === 'audio') as LocalAudioTrack;

  const [analyser, setAnalyser] = useState<AnalyserNode>();
  const isTrackEnabled = useIsTrackEnabled(audioTrack as LocalAudioTrack | RemoteAudioTrack);
  const mediaStreamTrack = useMediaStreamTrack(audioTrack);

  useEffect(() => {
    if (audioTrack && mediaStreamTrack && isTrackEnabled) {
      // Here we create a new MediaStream from a clone of the mediaStreamTrack.
      // A clone is created to allow multiple instances of this component for a single
      // AudioTrack on iOS Safari.
      let newMediaStream = new MediaStream([mediaStreamTrack.clone()]);

      // Here we listen for the 'stopped' event on the audioTrack. When the audioTrack is stopped,
      // we stop the cloned track that is stored in 'newMediaStream'. It is important that we stop
      // all tracks when they are not in use. Browsers like Firefox don't let you create a new stream
      // from a new audio device while the active audio device still has active tracks.
      const stopAllMediaStreamTracks = () => newMediaStream.getTracks().forEach((track) => track.stop());
      audioTrack.on('stopped', stopAllMediaStreamTracks);

      const reinitializeAnalyser = () => {
        stopAllMediaStreamTracks();
        newMediaStream = new MediaStream([mediaStreamTrack.clone()]);
        setAnalyser(initializeAnalyser(newMediaStream));
      };

      setAnalyser(initializeAnalyser(newMediaStream));

      // Here we reinitialize the AnalyserNode on focus to avoid an issue in Safari
      // where the analysers stop functioning when the user switches to a new tab
      // and switches back to the app.
      window.addEventListener('focus', reinitializeAnalyser);

      return () => {
        stopAllMediaStreamTracks();
        window.removeEventListener('focus', reinitializeAnalyser);
        audioTrack.off('stopped', stopAllMediaStreamTracks);
      };
    }
  }, [isTrackEnabled, mediaStreamTrack, audioTrack]);

  useEffect(() => {
    if (isTrackEnabled && analyser) {
      const sampleArray = new Uint8Array(analyser.frequencyBinCount);

      const timer = setInterval(() => {
        analyser.getByteFrequencyData(sampleArray);
        let values = 0;

        const length = sampleArray.length;
        for (let i = 0; i < length; i++) {
          values += sampleArray[i];
        }

        const volume = Math.min(21, Math.max(0, Math.log10(values / length / 3) * 14));

        if (volume > 10 && !isSpeaking) {
          updateIsSpeaking(true);
        } else if (volume <= 10 && isSpeaking) {
          updateIsSpeaking(false);
        }
      }, 300);

      return () => {
        clearInterval(timer);
      };
    } else {
      updateIsSpeaking(false);
    }
  }, [isTrackEnabled, analyser, isSpeaking, updateIsSpeaking]);
}
