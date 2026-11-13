import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/camera_ON.svg?react';

export type CameraOnIconProps = SvgIconProps;

export function CameraOnIcon(props: CameraOnIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
