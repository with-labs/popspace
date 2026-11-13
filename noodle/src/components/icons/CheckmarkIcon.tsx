import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/checkmark.svg?react';

export interface ICheckmarkIconProps extends SvgIconProps {}

export const CheckmarkIcon: React.FC<ICheckmarkIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
