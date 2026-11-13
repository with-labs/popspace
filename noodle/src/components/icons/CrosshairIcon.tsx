import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/crosshair.svg?react';

export interface ICrosshairIconProps extends SvgIconProps {}

export const CrosshairIcon: React.FC<ICrosshairIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
