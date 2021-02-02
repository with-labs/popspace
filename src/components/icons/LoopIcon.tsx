import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/loop.svg';

export interface ILoopIconProps extends SvgIconProps {}

export const LoopIcon: React.FC<ILoopIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
