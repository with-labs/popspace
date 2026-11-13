import { SvgIcon, SvgIconProps } from '@material-ui/core';
import * as React from 'react';

import Glyph from './svg/volume.svg?react';

export interface IVolumeIconProps extends SvgIconProps {}

export const VolumeIcon: React.FC<IVolumeIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
