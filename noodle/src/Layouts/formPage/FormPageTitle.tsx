import { Typography, TypographyProps } from '@material-ui/core';
import * as React from 'react';

export function FormPageTitle(props: TypographyProps) {
  return (
    <>
      <Typography variant="h1" style={{ marginBottom: 64 }} {...props} />
    </>
  );
}
