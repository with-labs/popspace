import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/edit.svg';

export interface IEditIconProps extends SvgIconProps {}

export const EditIcon: React.FC<IEditIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
