import * as React from 'react';
import { useFileDrop } from './useFileDrop';
import { FileDropGhost } from './FileDropGhost';
import { useFeatureFlag } from 'flagg';

export const FileDropLayer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...rest }, ref) => {
    const [bind, { targetPosition }] = useFileDrop();

    const [hasFileDrop] = useFeatureFlag('fileDrop');

    if (!hasFileDrop) {
      return <>{children}</>;
    }

    return (
      <div {...bind} ref={ref} {...rest}>
        {children}
        {targetPosition && <FileDropGhost position={targetPosition} />}
      </div>
    );
  }
);
