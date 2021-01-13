import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as LinkIcon } from './svg/tray_link.svg';
import { ReactComponent as StickyNoteIcon } from './svg/tray_sticky.svg';
import { ReactComponent as VideoIcon } from './svg/tray_video.svg';
import { ReactComponent as WhiteboardIcon } from './svg/tray_whiteboard.svg';
import { ReactComponent as ScreenShareIcon } from './svg/sharing_ON.svg';
import { WidgetType } from '../../roomState/types/widgets';

const icons: Partial<Record<WidgetType, React.FC<any>>> = {
  [WidgetType.Link]: LinkIcon,
  [WidgetType.StickyNote]: StickyNoteIcon,
  [WidgetType.Whiteboard]: WhiteboardIcon,
  [WidgetType.YouTube]: VideoIcon,
  [WidgetType.SidecarStream]: ScreenShareIcon,
};

export type AccessoryIconProps = SvgIconProps & {
  type: WidgetType;
};

export function AccessoryIcon({ type, ...props }: AccessoryIconProps) {
  const Glyph = icons[type];
  return (
    <SvgIcon {...props} viewBox="0 0 32 32">
      {Glyph && <Glyph />}
    </SvgIcon>
  );
}
