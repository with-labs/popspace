import * as React from 'react';
import { useRoomStore } from '../../../roomState/useRoomStore';

export interface IWidgetAuthorProps extends React.HTMLAttributes<HTMLSpanElement> {
  widgetId: string;
}

/**
 * Renders the name of a widget's author
 */
export const WidgetAuthor: React.FC<IWidgetAuthorProps> = ({ widgetId, ...rest }) => {
  const authorName = useRoomStore(
    React.useCallback(
      (room) => {
        const widget = room.widgets[widgetId];
        return widget?.ownerDisplayName ?? 'Anonymous';
      },
      [widgetId]
    )
  );

  return <span {...rest}>{authorName}</span>;
};
