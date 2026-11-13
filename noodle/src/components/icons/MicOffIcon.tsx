import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/audio_OFF.svg?react';

export type MicOffIconProps = SvgIconProps;

export function MicOffIcon(props: MicOffIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
