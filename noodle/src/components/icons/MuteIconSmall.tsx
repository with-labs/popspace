import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/avatar_mute.svg?react';

export interface IMuteIconSmallProps extends SvgIconProps {}

export const MuteIconSmall: React.FC<IMuteIconSmallProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 16 16">
    <Glyph />
  </SvgIcon>
);
