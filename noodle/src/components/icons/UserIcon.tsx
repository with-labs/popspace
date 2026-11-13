import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/user.svg?react';

export interface IUserIconProps extends SvgIconProps {}

export const UserIcon: React.FC<IUserIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
