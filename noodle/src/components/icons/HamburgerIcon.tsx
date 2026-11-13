import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/hamburger.svg?react';

export interface IHamburgerIconProps extends SvgIconProps {}

export const HamburgerIcon: React.FC<IHamburgerIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
