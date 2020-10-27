import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/add.svg';

export type AddIconProps = SvgIconProps;

export function AddIcon(props: AddIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
