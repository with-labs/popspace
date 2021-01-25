import * as React from 'react';
import { useFileDrop } from './useFileDrop';
import { FileDropGhost } from './FileDropGhost';

export const FileDropLayer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...rest }, ref) => {
    const [bind, { targetPosition }] = useFileDrop();

    return (
      <div {...bind} ref={ref} {...rest}>
        {children}
        {targetPosition && <FileDropGhost position={targetPosition} />}
      </div>
    );
  }
);
