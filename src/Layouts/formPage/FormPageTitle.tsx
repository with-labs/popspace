import { Typography, TypographyProps } from '@material-ui/core';
import * as React from 'react';
import { Logo } from '../../components/Logo/Logo';

export function FormPageTitle(props: TypographyProps) {
  return (
    <>
      <Logo link style={{ marginBottom: 16 }} />
      <Typography variant="h1" style={{ marginBottom: 64 }} {...props} />
    </>
  );
}
