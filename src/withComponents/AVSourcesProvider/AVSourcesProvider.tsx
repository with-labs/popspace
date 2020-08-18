/**
 * Bizarre little provider that is intended to propagate changes in the active audio/video device ids in the redux
 * store to the Twilio API and publish/unpublish audio/video trackes as necessary to achieve switching cameras and
 * microphones.
 *
 * Needs to be used inside of a ParticipantMetaContext so that we can read the active audio/video device ids from
 * the redux store.
 *
 * This also uses a double provider. The main AVSourcesProvider is what gets the AV sources and provides them to its
 * children. We also have the DummyProvider that invokes the `useHandleDeviceChange` hook. Because
 * `useHandleDeviceChange` is dependent on values from the AVSourcesProvider, it needs to be invoked in a separate
 * component nested inside the AVSourcesProvider. For simplicity's sake, that nested component lives in this component
 * alongside the AVSourcesProvider. The purpose of these two is intertwined enough that it seemed ok to do this.
 */

import React from 'react';

import { useHandleDeviceChange } from '../../withHooks/useHandleDeviceChange/useHandleDeviceChange';
import { useAVSources } from '../../withHooks/useAVSources/useAVSources';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useParticipantMeta } from '../../withHooks/useParticipantMeta/useParticipantMeta';

interface IAVSourcesContext {
  cameras: MediaDeviceInfo[];
  mics: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
}

export const AVSourcesContext = React.createContext<IAVSourcesContext>({ cameras: [], mics: [], speakers: [] });

export const AVSourcesProvider: React.FC<{}> = ({ children }) => {
  const devices = useAVSources();

  return (
    <AVSourcesContext.Provider value={devices}>
      <DummyProvider>{children}</DummyProvider>
    </AVSourcesContext.Provider>
  );
};

const DummyProvider: React.FC<{}> = ({ children }) => {
  const {
    room: { localParticipant },
  } = useVideoContext();

  const { activeCameraLabel, activeMicLabel } = useParticipantMeta(localParticipant);

  useHandleDeviceChange(activeCameraLabel, activeMicLabel);

  return <>{children}</>;
};
