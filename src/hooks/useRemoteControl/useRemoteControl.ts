import { useContext } from 'react';
import { RemoteControlContext } from '@components/RemoteControlProvider/RemoteControlProvider';

export function useRemoteControl() {
  const ctx = useContext(RemoteControlContext);
  if (!ctx) {
    throw new Error('useRemoteControl must be called within RemoteControlProvider');
  }
  return ctx;
}
