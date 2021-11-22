import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/crosshair.svg';

export interface ICrosshairIconProps extends SvgIconProps {}

export const CrosshairIcon: React.FC<ICrosshairIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
