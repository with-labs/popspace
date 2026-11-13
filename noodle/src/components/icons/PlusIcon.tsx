import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/plus.svg?react';

export type PlusIconProps = SvgIconProps;

export function PlusIcon(props: PlusIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
