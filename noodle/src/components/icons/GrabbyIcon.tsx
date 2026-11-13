import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/grabby.svg?react';

export interface IGrabbyIconProps extends SvgIconProps {}

export const GrabbyIcon: React.FC<IGrabbyIconProps> = (props) => (
  // adjust viewbox as this icon has a different size
  <SvgIcon {...props} viewBox="0 0 12 20">
    <Glyph />
  </SvgIcon>
);
