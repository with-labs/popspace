import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/logo.svg';

export interface ILogoIconProps extends SvgIconProps {}

export const LogoIcon: React.FC<ILogoIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
