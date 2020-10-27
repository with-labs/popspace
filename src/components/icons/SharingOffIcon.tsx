import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/sharing_OFF.svg';

export type SharingOffIconProps = SvgIconProps;

export function SharingOffIcon(props: SharingOffIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
