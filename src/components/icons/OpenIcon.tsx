import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/open.svg';

export interface IOpenIconProps extends SvgIconProps {}

export const OpenIcon: React.FC<IOpenIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
