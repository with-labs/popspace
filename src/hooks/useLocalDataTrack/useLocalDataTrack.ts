import { useMemo } from 'react';
import { LocalDataTrack } from 'twilio-video';
import useVideoContext from '../useVideoContext/useVideoContext';

export function useLocalDataTrack() {
  const { localTracks } = useVideoContext();

  const localDT = useMemo(() => {
    // It's OK to assume that there is a local data track.
    return localTracks.find((track) => track.kind === 'data') as LocalDataTrack;
  }, [localTracks]);

  return localDT;
}
