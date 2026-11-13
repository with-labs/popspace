import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/leave.svg?react';

export interface ILeaveIconProps extends SvgIconProps {}

export const LeaveIcon: React.FC<ILeaveIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
