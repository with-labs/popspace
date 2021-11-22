import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/wallpaper.svg';

export interface IWallpaperIconProps extends SvgIconProps {}

export const WallpaperIcon: React.FC<IWallpaperIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
