/**
 * Bizarre little provider that is intended to propagate changes in the active audio/video device ids in the redux
 * store to the Twilio API and publish/unpublish audio/video trackes as necessary to achieve switching cameras and
 * microphones.
 *
 * Needs to be used inside of a ParticipantMetaContext so that we can read the active audio/video device ids from
 * the redux store.
 */

import React from 'react';

import { useHandleDeviceChange } from '../../withHooks/useHandleDeviceChange/useHandleDeviceChange';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useParticipantMeta } from '../../withHooks/useParticipantMeta/useParticipantMeta';

export const AVSourcesProvider: React.FC<{}> = ({ children }) => {
  const {
    room: { localParticipant },
  } = useVideoContext();

  const { activeCameraId, activeMicId } = useParticipantMeta(localParticipant);

  useHandleDeviceChange(activeCameraId, activeMicId);

  return <>{children}</>;
};
