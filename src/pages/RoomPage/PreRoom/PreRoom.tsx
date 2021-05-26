import React from 'react';
import { FullscreenLoading } from '@components/FullscreenLoading/FullscreenLoading';
import { RequestPermissions } from './RequestPermissions';
import { EntryView } from './EntryView';
import { Analytics } from '@analytics/Analytics';
import { EventNames, Origin } from '@analytics/constants';
import { useHistory } from 'react-router';
export interface IPreRoomProps {
  onReady: () => void;
}

function useHasGrantedPermission() {
  const [isGranted, setIsGranted] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      // get the list of devices that have been given permission,
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
      // docs state that a device that is active or has permissions will have a label set,
      // so we are going off of that assumption
      const hasActiveDevices = devices.some(
        (val) =>
          val.deviceId !== 'default' &&
          ((val.kind === 'audioinput' && val.label !== '') || (val.kind === 'videoinput' && val.label !== ''))
      );
      setIsGranted(hasActiveDevices);
    });
  }, []);

  return [isGranted, setIsGranted] as const;
}

export const PreRoom: React.FC<IPreRoomProps> = ({ onReady }) => {
  const [hasGrantedPermission, setHasGrantedPermission] = useHasGrantedPermission();
  const history = useHistory<{ origin?: string; ref?: string }>();

  // grab anaylitcs information
  const queryRef = history.location.state?.ref || '';
  const funnelOrigin = history.location.state?.origin || '';
  // if we arent passed a funnel origin, we must be coming from the dashboard
  const origin = funnelOrigin ?? Origin.DASHBOARD;

  const onRequestPermissionCompleteHandler = (isPermissionsSet: boolean) => {
    Analytics.trackEvent(EventNames.BROWSER_PERMISSION, {
      origin,
      ref: queryRef,
      accepted_media_permisssions: isPermissionsSet,
    });
    setHasGrantedPermission(true);
  };

  const handleEntryComplete = () => {
    onReady();
  };

  if (hasGrantedPermission === undefined) return <FullscreenLoading />;

  if (!hasGrantedPermission) return <RequestPermissions onComplete={onRequestPermissionCompleteHandler} />;

  return <EntryView onComplete={handleEntryComplete} />;
};
