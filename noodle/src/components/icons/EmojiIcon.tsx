import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/emoji.svg?react';

export type EmojiIconProps = SvgIconProps;

export function EmojiIcon(props: EmojiIconProps) {
  return (
    <SvgIcon {...props}>
      <Glyph />
    </SvgIcon>
  );
}
