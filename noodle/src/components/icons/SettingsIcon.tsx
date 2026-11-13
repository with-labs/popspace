import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/settings.svg?react';

export type SettingsIconProps = SvgIconProps;

export function SettingsIcon(props: SettingsIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
