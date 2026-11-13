import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/camera_OFF.svg?react';

export type CameraOffIconProps = SvgIconProps;

export function CameraOffIcon(props: CameraOffIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
