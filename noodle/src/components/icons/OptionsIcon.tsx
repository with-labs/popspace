import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/options.svg?react';

export type OptionsIconProps = SvgIconProps;

export function OptionsIcon(props: OptionsIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
