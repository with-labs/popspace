import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/dropdown.svg?react';

export type DropdownIconProps = SvgIconProps;

export function DropdownIcon(props: DropdownIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
