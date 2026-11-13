import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/bandwidth.svg?react';

export type BandwidthIconProps = SvgIconProps;

export function BandwidthIcon(props: BandwidthIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
