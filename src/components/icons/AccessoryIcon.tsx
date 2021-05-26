import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import linkSrc from './png/link.png';
import stickySrc from './png/sticky.png';
import videoSrc from './png/youtube.png';
import whiteboardSrc from './png/whiteboard.png';
import embedSrc from './png/embed.png';
import { ReactComponent as FileIcon } from './svg/widget_upload.svg';
import { ReactComponent as EmojiIcon } from './svg/emoji.svg';
import { ReactComponent as ScreenShareIcon } from './svg/sharing_ON.svg';
import { WidgetType } from '@roomState/types/widgets';

const icons = {
  [WidgetType.Link]: linkSrc,
  [WidgetType.StickyNote]: stickySrc,
  [WidgetType.Whiteboard]: whiteboardSrc,
  [WidgetType.YouTube]: videoSrc,
  [WidgetType.SidecarStream]: ScreenShareIcon,
  file: FileIcon,
  embed: embedSrc,
  status: EmojiIcon,
};

export type AccessoryIconType = keyof typeof icons;

export type AccessoryIconProps = Omit<SvgIconProps, 'ref'> & {
  type: AccessoryIconType;
};

export function AccessoryIcon({ type, ...props }: AccessoryIconProps) {
  const Glyph = icons[type];

  if (typeof Glyph === 'string') {
    return <img alt={`${type} icon`} style={{ width: 32, height: 32 }} src={Glyph} />;
  }

  return (
    <SvgIcon {...props} viewBox="0 0 32 32">
      {Glyph && <Glyph />}
    </SvgIcon>
  );
}
