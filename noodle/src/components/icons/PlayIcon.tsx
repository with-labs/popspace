import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/play.svg?react';

export interface IPlayIconProps extends SvgIconProps {}

export const PlayIcon: React.FC<IPlayIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
