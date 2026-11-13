import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/minus.svg?react';

export interface IMinusIconProps extends SvgIconProps {}

export const MinusIcon: React.FC<IMinusIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
