import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/copy.svg?react';

export type CopyIconProps = SvgIconProps;

export function CopyIcon(props: CopyIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
