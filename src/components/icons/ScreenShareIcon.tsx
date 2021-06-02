import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/screenShare.svg';

export type ScreenShareIconProps = SvgIconProps;

export function ScreenShareIcon(props: ScreenShareIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
