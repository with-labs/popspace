import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useResizeContext } from '../../../../components/ResizeContainer/ResizeContainer';
import { ScreenShare } from '../../../../components/ScreenShare/ScreenShare';
import { SharingOffIcon } from '../../../../components/icons/SharingOffIcon';
import { RemoteTrackPublication, LocalTrackPublication } from 'twilio-video';

export interface IScreenShareViewerProps {
  className?: string;
  participantSid: string | null;
  isFullscreen: boolean;
  onFullscreenExit: () => void;
  onShareEnd: () => void;
}

/**
 *
 */
export const ScreenShareViewer: React.FC<IScreenShareViewerProps> = ({ onShareEnd, ...props }) => {
  const { t } = useTranslation();

  const { remeasure } = useResizeContext();
  const remeasureTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const handleSourceChange = React.useCallback(
    (newPub: RemoteTrackPublication | LocalTrackPublication | null) => {
      remeasureTimeoutRef.current = setTimeout(remeasure, 20);
      if (!newPub) {
        onShareEnd();
      }
    },
    [remeasure, onShareEnd]
  );

  React.useEffect(() => {
    // cleanup remeasure timeout if the component unmounts, to address
    // state update on unmounted component errors
    if (remeasureTimeoutRef.current) {
      clearTimeout(remeasureTimeoutRef.current);
    }
  }, []);

  // kind of a hack to force an icon in here, idk what else to do...
  const empty = t('widgets.screenShare.emptyMessage');
  const [emptyBefore, emptyAfter] = empty.split('#');
  const emptyWithIcon = (
    <>
      {emptyBefore}
      <SharingOffIcon fontSize="default" style={{ marginBottom: -6 }} />
      {emptyAfter}
    </>
  );

  return (
    <ScreenShare
      {...props}
      onSourceChange={handleSourceChange}
      emptyMessage={emptyWithIcon}
      id={`${props.participantSid}-screenShare`}
      keepPublishedOnUnmount
    />
  );
};
