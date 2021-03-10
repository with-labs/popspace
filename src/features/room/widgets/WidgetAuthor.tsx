import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { WidgetType } from '../../../roomState/types/widgets';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { useWidgetContext } from './useWidgetContext';

export interface IWidgetAuthorProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * Renders the name of a widget's author
 */
export const WidgetAuthor: React.FC<IWidgetAuthorProps> = (props) => {
  const { t } = useTranslation();

  const {
    widget: { ownerDisplayName: authorName, ownerId },
  } = useWidgetContext<WidgetType.StickyNote>();

  const userId = useRoomStore((room) => room.sessionLookup[room.sessionId ?? '']);

  return <span {...props}>{ownerId === userId ? t('common.you') : authorName ?? t('common.anonymous')}</span>;
};
