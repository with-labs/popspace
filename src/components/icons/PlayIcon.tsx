import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/play.svg';

export interface IPlayIconProps extends SvgIconProps {}

export const PlayIcon: React.FC<IPlayIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
