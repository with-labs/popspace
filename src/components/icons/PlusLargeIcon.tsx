import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/plus_large.svg';

export interface IPlusLargeIconProps extends SvgIconProps {}

export const PlusLargeIcon: React.FC<IPlusLargeIconProps> = (props) => (
  // this icon is only 18px in size, so adjust viewbox accordingly
  <SvgIcon {...props} viewBox="0 0 18 18">
    <Glyph />
  </SvgIcon>
);
