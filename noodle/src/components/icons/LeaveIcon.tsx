import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/leave.svg';

export interface ILeaveIconProps extends SvgIconProps {}

export const LeaveIcon: React.FC<ILeaveIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
