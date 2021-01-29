import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as LinkIcon } from './svg/widget_link.svg';
import { ReactComponent as StickyNoteIcon } from './svg/widget_stickynote.svg';
import { ReactComponent as VideoIcon } from './svg/widget_youtube.svg';
import { ReactComponent as WhiteboardIcon } from './svg/widget_whiteboard.svg';
import { ReactComponent as FileIcon } from './svg/widget_upload.svg';
import { ReactComponent as EmbedIcon } from './svg/widget_embed.svg';
import { ReactComponent as EmojiIcon } from './svg/emoji.svg';
import { ReactComponent as ScreenShareIcon } from './svg/sharing_ON.svg';
import { WidgetType } from '../../roomState/types/widgets';

const icons = {
  [WidgetType.Link]: LinkIcon,
  [WidgetType.StickyNote]: StickyNoteIcon,
  [WidgetType.Whiteboard]: WhiteboardIcon,
  [WidgetType.YouTube]: VideoIcon,
  [WidgetType.SidecarStream]: ScreenShareIcon,
  file: FileIcon,
  embed: EmbedIcon,
  status: EmojiIcon,
};

export type AccessoryIconType = keyof typeof icons;

export type AccessoryIconProps = SvgIconProps & {
  type: AccessoryIconType;
};

export function AccessoryIcon({ type, ...props }: AccessoryIconProps) {
  const Glyph = icons[type];
  return (
    <SvgIcon {...props} viewBox="0 0 32 32">
      {Glyph && <Glyph />}
    </SvgIcon>
  );
}
