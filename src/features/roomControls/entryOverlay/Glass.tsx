import * as React from 'react';

export function Glass({ className }: { className?: string }) {
  return <div style={{ backdropFilter: 'blur(4px)' }} className={className} />;
}
