import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/whats_new.svg?react';

export interface IWhatsNewIconProps extends SvgIconProps {}

export const WhatsNewIcon: React.FC<IWhatsNewIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 11 12.5">
    <Glyph />
  </SvgIcon>
);
