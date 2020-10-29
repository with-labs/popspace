import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/audio_ON.svg';

export type MicOnIconProps = SvgIconProps;

export function MicOnIcon(props: MicOnIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
