import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/camera_OFF.svg';

export type CameraOffIconProps = SvgIconProps;

export function CameraOffIcon(props: CameraOffIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
