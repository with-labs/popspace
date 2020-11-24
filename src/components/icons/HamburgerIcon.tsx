import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/hamburger.svg';

export interface IHamburgerIconProps extends SvgIconProps {}

export const HamburgerIcon: React.FC<IHamburgerIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
