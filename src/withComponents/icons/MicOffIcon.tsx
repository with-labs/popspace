import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/audio_OFF.svg';

export type MicOffIconProps = SvgIconProps;

export function MicOffIcon(props: MicOffIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
