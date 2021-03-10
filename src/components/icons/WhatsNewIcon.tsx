import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/whats_new.svg';

export interface IWhatsNewIconProps extends SvgIconProps {}

export const WhatsNewIcon: React.FC<IWhatsNewIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 11 12.5">
    <Glyph />
  </SvgIcon>
);
