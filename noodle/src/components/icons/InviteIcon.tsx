import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/invite.svg?react';

export type InviteIcontProps = SvgIconProps;

export function InviteIcon(props: InviteIcontProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
