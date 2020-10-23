import * as React from 'react';
import { ListItemIcon, ListItemText, MenuItem } from '@material-ui/core';
import { useAddAccessory } from './useAddAccessory';
import { AccessoryIcon } from '../../../../withComponents/icons/AccessoryIcon';
import { WidgetType, WidgetData } from '../../../../types/room';

const names: Record<WidgetType, string> = {
  [WidgetType.Link]: 'Link',
  [WidgetType.StickyNote]: 'Sticky Note',
  [WidgetType.Whiteboard]: 'Whiteboard',
  [WidgetType.YouTube]: 'YouTube',
};

const accessoryEmptyData: Record<WidgetType, WidgetData> = {
  [WidgetType.Link]: {
    title: 'Link',
    url: '',
  },
  [WidgetType.StickyNote]: {
    text: '',
    author: '',
  },
  [WidgetType.Whiteboard]: {
    whiteboardState: {
      lines: [],
    },
  },
  [WidgetType.YouTube]: {
    videoId: '',
    playStartedTimestampUTC: null,
  },
};

export interface IAddAccessoryMenuItemProps {
  accessoryType: WidgetType;
  onClick?: () => void;
}

export const AddAccessoryMenuItem = React.forwardRef<HTMLLIElement, IAddAccessoryMenuItemProps>(
  ({ accessoryType, onClick }, ref) => {
    const addWidget = useAddAccessory();
    const handleClick = React.useCallback(() => {
      onClick?.();
      // wrapped in a timeout so that all sync effects of the click are processed and done before
      // the widget is added - this gives time for the menu to close, for example, and move the window
      // focus element back to the button, before the widget is mounted and steals focus (for example,
      // most widget create forms have an autoFocus input)
      setTimeout(() => {
        // whiteboards publish immediately, they have no draft state.
        addWidget({
          type: accessoryType,
          initialData: accessoryEmptyData[accessoryType],
          publishImmediately: accessoryType === WidgetType.Whiteboard,
          screenCoordinate: {
            x: 300,
            y: 300,
          },
        });
      });
    }, [accessoryType, addWidget, onClick]);

    return (
      <MenuItem onClick={handleClick} ref={ref}>
        <ListItemIcon>
          <AccessoryIcon type={accessoryType} />
        </ListItemIcon>
        <ListItemText>{names[accessoryType] || ''}</ListItemText>{' '}
      </MenuItem>
    );
  }
);
