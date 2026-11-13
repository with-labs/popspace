import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/save.svg?react';

export interface ISaveIconProps extends SvgIconProps {}

export const SaveIcon: React.FC<ISaveIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
