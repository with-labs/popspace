import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/copy.svg';

export type CopyIconProps = SvgIconProps;

export function CopyIcon(props: CopyIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
