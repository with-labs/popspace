import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalTracks } from '../../components/LocalTracksProvider/useLocalTracks';
import { useMediaReady } from '../../components/MediaReadinessProvider/useMediaReady';
import { PictureInPictureCanvas } from './PictureInPictureCanvas';

/**
 * This hook constructs an internal Picture In Picture screen
 * and provides controls to activate and deactivate it.
 *
 * Simply calling this hook will register the PIP display to
 * automatically activate in an installed PWA if that feature
 * is available.
 */
export function usePictureInPicture() {
  const isReady = useMediaReady();

  const canvasRef = useRef<PictureInPictureCanvas | null>(null);
  const [active, setActive] = useState(false);

  // the main effect that sets up and disposes the PIP Canvas
  // when this component mounts / unmounts.
  useEffect(() => {
    const canvas = new PictureInPictureCanvas();
    canvasRef.current = canvas;

    canvas.on('stateChange', setActive);

    return () => {
      canvas.off('stateChange', setActive);
      canvas.dispose();
    };
    // WARNING: should never have dependencies! Use refs to avoid
    // retriggering this effect or make a new effect!
  }, []);

  const { audioTrack, videoTrack } = useLocalTracks();
  const muted = !audioTrack;
  const cameraOn = !!videoTrack;

  useEffect(() => {
    canvasRef.current?.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    canvasRef.current?.setCameraOn(cameraOn);
  }, [cameraOn]);

  const togglePip = useCallback(async () => {
    if (!isReady) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    if (canvas.isActive) {
      await canvas.deactivate();
      return;
    }

    await canvas.activate();
  }, [isReady]);

  return [active, togglePip] as const;
}
