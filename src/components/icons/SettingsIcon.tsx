import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/settings.svg';

export type SettingsIconProps = SvgIconProps;

export function SettingsIcon(props: SettingsIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
