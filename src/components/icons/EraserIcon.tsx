import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/eraser.svg';

export interface IEraserIconProps extends SvgIconProps {}

export const EraserIcon: React.FC<IEraserIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
