import { useEffect, useRef } from 'react';
import { LocalAudioTrackPublication } from 'twilio-video';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import usePublications from '../../hooks/usePublications/usePublications';

import { useParticipantMeta } from '../useParticipantMeta/useParticipantMeta';
import { useParticipantMetaContext } from '../../withComponents/ParticipantMetaProvider/useParticipantMetaContext';

export function useLocalVolumeDetection() {
  const audioContextRef = useRef<AudioContext | null>();
  const audioAnalyzerRef = useRef<AnalyserNode | null>();
  const detectionIntervalRef = useRef<any>();

  const {
    room: { localParticipant },
  } = useVideoContext();

  const { isSpeaking } = useParticipantMeta(localParticipant);
  const { updateIsSpeaking } = useParticipantMetaContext();

  const publications = usePublications(localParticipant);

  useEffect(() => {
    const audioPub = publications.find(pub => pub.kind === 'audio') as LocalAudioTrackPublication;
    const mediaStreamTrack = audioPub?.track?.mediaStreamTrack;

    if (mediaStreamTrack && !audioContextRef.current) {
      // Set up audio metering.
      audioContextRef.current = new AudioContext();

      // This is hacky. Twilio only gives us a stream track, so we have to create a new media stream with that track.
      // Create a MediaStream, add the track from the Twilio API to that stream, and get the media stream source from
      // the AudioContext created above.
      const mediaStream = new MediaStream();
      mediaStream.addTrack(mediaStreamTrack);
      const mediaStreamSource = audioContextRef.current.createMediaStreamSource(mediaStream);

      // AnalyserNodes can be used to get frequency data from a media stream.
      // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
      audioAnalyzerRef.current = audioContextRef.current.createAnalyser();
      // fftSize is effectively the number of samples to take of the audio stream.
      // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
      audioAnalyzerRef.current.fftSize = 256;
      const dataArray = new Uint8Array(audioAnalyzerRef.current.frequencyBinCount);

      // Connect the AnalyserNode to the media stream source.
      mediaStreamSource.connect(audioAnalyzerRef.current);

      // Callback to read media stream data, calculate a "volume", and update the speaking state of local participant.
      const pollAudio = function() {
        if (audioAnalyzerRef.current) {
          // Get the array of byte frequencies for the stream. Each value in the array represents a decibel value for
          // a frequency in the stream.
          // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData
          audioAnalyzerRef.current.getByteFrequencyData(dataArray);

          // Borrowed the math from this example: https://github.com/cwilso/volume-meter/blob/master/volume-meter.js#L79
          let sum = 0;
          for (let i = 0; i < audioAnalyzerRef.current.frequencyBinCount; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const vol = Math.sqrt(sum / audioAnalyzerRef.current.frequencyBinCount);

          // The use of `50` is completely arbitrary. It seemed like a good value to use as the speaking threshold
          // during my testing, but can be tweaked later if necessary.
          if (vol >= 50 && !isSpeaking) {
            updateIsSpeaking(true);
          } else if (vol < 50 && isSpeaking) {
            updateIsSpeaking(false);
          }
        }
      };

      detectionIntervalRef.current = setInterval(pollAudio, 300);
    } else if (!mediaStreamTrack) {
      // Tear down audio metering.
      if (audioAnalyzerRef.current) {
        audioAnalyzerRef.current.disconnect();
        audioAnalyzerRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      clearInterval(detectionIntervalRef.current);
      updateIsSpeaking(false);
    }

    return () => {
      audioAnalyzerRef.current?.disconnect();
      audioAnalyzerRef.current = null;
      audioContextRef.current?.close();
      audioContextRef.current = null;
      clearInterval(detectionIntervalRef.current);
    };
  }, [publications, updateIsSpeaking, isSpeaking]);
}
