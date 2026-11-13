import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/chat.svg?react';

export type ChatIconProps = SvgIconProps;

export function ChatIcon(props: ChatIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
