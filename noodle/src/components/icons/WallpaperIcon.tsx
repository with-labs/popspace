import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/wallpaper.svg?react';

export interface IWallpaperIconProps extends SvgIconProps {}

export const WallpaperIcon: React.FC<IWallpaperIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
