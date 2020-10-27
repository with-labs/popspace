import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/minus.svg';

export interface IMinusIconProps extends SvgIconProps {}

export const MinusIcon: React.FC<IMinusIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
