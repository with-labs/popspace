import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/minimize.svg';

export interface IMinimizeIconProps extends SvgIconProps {}

export const MinimizeIcon: React.FC<IMinimizeIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
