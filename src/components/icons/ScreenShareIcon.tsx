import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/screenShare.svg';

export type SreenShareIconProps = SvgIconProps;

export function ScreenShareIcon(props: SreenShareIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
