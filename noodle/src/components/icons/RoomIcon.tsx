import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/room_icon.svg?react';

export interface IRoomIconProps extends SvgIconProps {}

export const RoomIcon: React.FC<IRoomIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
