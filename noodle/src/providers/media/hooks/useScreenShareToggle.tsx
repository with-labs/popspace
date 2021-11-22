import { useCallback, useState } from 'react';
import { useLocalTracks } from './useLocalTracks';
import { Analytics } from '@analytics/Analytics';
import { EventNames } from '@analytics/constants';
import { useLocalParticipant } from '@providers/twilio/hooks/useLocalParticipant';
import { WidgetType } from '@api/roomState/types/widgets';
import { useAddAccessory } from '@features/roomControls/addContent/quickActions/useAddAccessory';
import { INITIAL_SIZE } from '../../../features/room/widgets/sidecarStream/constants';
import client from '@api/client';

export default function useScreenShareToggle() {
  const { screenShareVideoTrack, screenShareAudioTrack, startScreenShare, stopScreenShare } = useLocalTracks();
  const localParticipant = useLocalParticipant();
  const [activeScreenShareId, setActiveScreenShareId] = useState<string>();

  const addWidget = useAddAccessory();

  const anyScreenShareTrack = screenShareVideoTrack || screenShareAudioTrack;
  const toggleScreenShareEnabled = useCallback(async () => {
    Analytics.trackEvent(EventNames.TOGGLE_SCREENSHARE, !anyScreenShareTrack, {
      isOn: !anyScreenShareTrack,
      timestamp: new Date().getTime(),
    });

    if (anyScreenShareTrack) {
      stopScreenShare();
      if (activeScreenShareId) {
        client.widgets.deleteWidget({ widgetId: activeScreenShareId });
      }
    } else {
      const tracks = await startScreenShare();

      if (localParticipant && tracks) {
        const widget = await addWidget({
          type: WidgetType.SidecarStream,
          initialData: {
            twilioParticipantIdentity: localParticipant?.identity,
            videoTrackName: tracks?.videoName ?? undefined,
            audioTrackName: tracks?.audioName ?? undefined,
          },
          size: INITIAL_SIZE,
        });
        setActiveScreenShareId(widget.widgetId);
      }
    }
  }, [
    anyScreenShareTrack,
    stopScreenShare,
    startScreenShare,
    addWidget,
    localParticipant,
    setActiveScreenShareId,
    activeScreenShareId,
  ]);

  return [!!anyScreenShareTrack, toggleScreenShareEnabled] as const;
}
