import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/link.svg?react';

export type LinkIconProps = SvgIconProps;

export function LinkIcon(props: LinkIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
