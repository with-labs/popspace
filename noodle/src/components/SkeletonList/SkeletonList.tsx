import { Skeleton, SkeletonProps } from '@material-ui/lab';
import * as React from 'react';

export function SkeletonList({ count = 20, ...rest }: SkeletonProps & { count?: number }) {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <Skeleton width="100%" height="100%" key={i} variant="rect" {...rest} />
        ))}
    </>
  );
}
