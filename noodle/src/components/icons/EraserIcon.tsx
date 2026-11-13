import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/eraser.svg?react';

export interface IEraserIconProps extends SvgIconProps {}

export const EraserIcon: React.FC<IEraserIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
