import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/away.svg';

export interface IAwayIconProps extends SvgIconProps {}

export const AwayIcon: React.FC<IAwayIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
