import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/resize_handle.svg?react';

export interface IResizeHandleIconProps extends SvgIconProps {}

export const ResizeHandleIcon: React.FC<IResizeHandleIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
