import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/loop.svg?react';

export interface ILoopIconProps extends SvgIconProps {}

export const LoopIcon: React.FC<ILoopIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
