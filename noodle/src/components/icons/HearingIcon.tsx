import { SvgIcon, SvgIconProps } from '@material-ui/core';
import * as React from 'react';

import { ReactComponent as Glyph } from './svg/hearing.svg';

export type HearingIconProps = SvgIconProps;

export function HearingIcon(props: HearingIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
