import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/delete.svg?react';

export type DeleteIconProps = SvgIconProps;

export function DeleteIcon(props: DeleteIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
