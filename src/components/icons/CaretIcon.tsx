import { SvgIcon, SvgIconProps } from '@material-ui/core';
import * as React from 'react';

import { ReactComponent as Glyph } from './svg/caret.svg';

export type CaretIconProps = SvgIconProps;

export function CaretIcon(props: CaretIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
