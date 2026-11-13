import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/audio_ON.svg?react';

export type MicOnIconProps = SvgIconProps;

export function MicOnIcon(props: MicOnIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
