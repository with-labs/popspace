import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/sharing_ON.svg';

export type SharingOnIconProps = SvgIconProps;

export function SharingOnIcon(props: SharingOnIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
