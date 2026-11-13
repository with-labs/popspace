import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/action.svg?react';

export interface IActionIconProps extends SvgIconProps {}

export const ActionIcon: React.FC<IActionIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 14 20">
    <Glyph />
  </SvgIcon>
);
