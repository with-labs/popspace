import * as React from 'react';
import { useFileDrop } from './useFileDrop';
import { FileDropGhost } from './FileDropGhost';
import { useFeatureFlag } from 'flagg';

export const FileDropLayer: React.FC = ({ children }) => {
  const [bind, { targetPosition }] = useFileDrop();

  const [hasFileDrop] = useFeatureFlag('fileDrop');

  if (!hasFileDrop) {
    return <>{children}</>;
  }

  return (
    <div {...bind}>
      {children}
      {targetPosition && <FileDropGhost position={targetPosition} />}
    </div>
  );
};
