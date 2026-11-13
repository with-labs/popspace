import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/pause.svg?react';

export interface IPauseIconProps extends SvgIconProps {}

export const PauseIcon: React.FC<IPauseIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
