import { SvgIcon, SvgIconProps } from '@material-ui/core';
import * as React from 'react';

import Glyph from './svg/mute.svg?react';

export interface IMuteIconProps extends SvgIconProps {}

export const MuteIcon: React.FC<IMuteIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
