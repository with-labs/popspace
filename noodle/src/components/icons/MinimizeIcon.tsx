import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/minimize.svg?react';

export interface IMinimizeIconProps extends SvgIconProps {}

export const MinimizeIcon: React.FC<IMinimizeIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
