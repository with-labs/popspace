import * as React from 'react';
import { useFileDrop } from './useFileDrop';
import { FileDropGhost } from './FileDropGhost';

export const FileDropLayer: React.FC = ({ children }) => {
  const [bind, { targetPosition }] = useFileDrop();

  // TODO: feature flag!

  return (
    <div {...bind}>
      {children}
      {targetPosition && <FileDropGhost position={targetPosition} />}
    </div>
  );
};
