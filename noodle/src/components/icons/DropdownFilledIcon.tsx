import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/dropdown_filled.svg?react';

export interface IDropdownFilledIconProps extends SvgIconProps {}

export const DropdownFilledIcon: React.FC<IDropdownFilledIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <Glyph />
  </SvgIcon>
);
