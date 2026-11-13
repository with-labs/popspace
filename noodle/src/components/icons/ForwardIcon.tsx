import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/forward.svg?react';

export type ForwardIconProps = SvgIconProps;

export function ForwardIcon(props: ForwardIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
