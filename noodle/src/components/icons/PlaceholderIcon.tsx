import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/placeholder.svg?react';

export type PlaceholderIconProps = SvgIconProps;

export function PlaceholderIcon(props: PlaceholderIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
