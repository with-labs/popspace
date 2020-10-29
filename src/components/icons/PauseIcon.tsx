import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/pause.svg';

export interface IPauseIconProps extends SvgIconProps {}

export const PauseIcon: React.FC<IPauseIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
