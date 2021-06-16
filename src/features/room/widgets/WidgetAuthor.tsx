import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { WidgetType } from '@api/roomState/types/widgets';
import { useRoomStore } from '@api/useRoomStore';
import { useWidgetContext } from './useWidgetContext';

export interface IWidgetAuthorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Disables showing "You" for the local user, shows their name instead */
  disableYou?: boolean;
}

/**
 * Renders the name of a widget's author
 */
export const WidgetAuthor: React.FC<IWidgetAuthorProps> = ({ disableYou, ...props }) => {
  const { t } = useTranslation();

  const {
    widget: { creatorDisplayName: authorName, creatorId: ownerId },
  } = useWidgetContext<WidgetType.StickyNote>();

  const userId = useRoomStore((room) => room.sessionLookup[room.sessionId ?? '']);
  const showYou = !disableYou && ownerId === userId;

  return <span {...props}>{showYou ? t('common.you') : authorName ?? t('common.anonymous')}</span>;
};
