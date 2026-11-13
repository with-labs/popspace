import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/edit.svg?react';

export interface IEditIconProps extends SvgIconProps {}

export const EditIcon: React.FC<IEditIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
