import { useContext } from 'react';
import { HuddleContext } from '../../withComponents/HuddleProvider/HuddleProvider';

export default function useHuddleContext() {
  const context = useContext(HuddleContext);

  if (!context) {
    throw new Error('useHuddleContext must be used within a HuddleContext');
  }

  return context;
}
