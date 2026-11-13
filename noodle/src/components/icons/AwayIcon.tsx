import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/away.svg?react';

export interface IAwayIconProps extends SvgIconProps {}

export const AwayIcon: React.FC<IAwayIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
