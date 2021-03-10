import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/checkmark.svg';

export interface ICheckmarkIconProps extends SvgIconProps {}

export const CheckmarkIcon: React.FC<ICheckmarkIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
