import React, { useEffect } from 'react';
import { FullscreenLoading } from '../../../components/FullscreenLoading/FullscreenLoading';
import { RequestPermissions } from './RequestPermissions';
import { useCurrentUserProfile } from '../../../hooks/api/useCurrentUserProfile';
import { EntryView } from './EntryView';
import { Analytics } from '../../../analytics/Analytics';
import { EventNames, Origin } from '../../../analytics/constants';
import { useHistory } from 'react-router';
import { RouteNames } from '../../../constants/RouteNames';
import { useOrderedRooms } from '../../../hooks/useOrderedRooms/useOrderedRooms';
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
  const { profile, error, isLoading } = useCurrentUserProfile();
  const { rooms, isLoading: isRoomsLoading } = useOrderedRooms(profile);
  const history = useHistory<{ origin?: string; ref?: string }>();

  // grab anaylitcs information
  const queryRef = history.location.state?.ref || '';
  const funnelOrigin = history.location.state?.origin || '';
  // if we arent passed a funnel origin, we must be coming from the dashboard
  const origin = funnelOrigin ?? Origin.DASHBOARD;

  // boot to signin if there's an error fetching profile data
  useEffect(() => {
    if (error) {
      history.push(RouteNames.SIGN_IN);
    }
  }, [error, history]);

  // boot to create room if there are no rooms
  const hasNoRooms = !isLoading && !error && rooms.length === 0;
  useEffect(() => {
    if (hasNoRooms) {
      history.push(`${RouteNames.CREATE_ROOM}?onboarding=true`);
    }
  }, [hasNoRooms, history]);

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

  return <EntryView rooms={rooms} onComplete={handleEntryComplete} />;
};
