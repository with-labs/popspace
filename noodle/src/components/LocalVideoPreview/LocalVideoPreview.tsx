import Publication from '../Publication/Publication';
import { useLocalTrack } from '@src/media/hooks';
import { TrackType } from '@withso/pop-media-sdk';

export default function LocalVideoPreview({ className }: { className?: string }) {
  const cameraTrack = useLocalTrack(TrackType.Camera);

  return cameraTrack ? <Publication track={cameraTrack} isLocal classNames={className} /> : null;
}
