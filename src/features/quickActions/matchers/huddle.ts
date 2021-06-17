import { TFunction } from 'i18next';
import { WidgetType } from '@api/roomState/types/widgets';
import { isSmallScreen } from '@utils/environment';
import { INITIAL_SIZE } from '@features/room/widgets/huddle/constants';
import { QuickAction, QuickActionKind } from '../types';

export function huddleQuickActions(prompt: string, t: TFunction): QuickAction[] {
  // empty default actions are only on mobile right now
  if ((!prompt && isSmallScreen()) || prompt.toLowerCase().startsWith('huddle')) {
    return [
      {
        kind: QuickActionKind.AddAccessory,
        icon: WidgetType.Huddle,
        accessoryType: WidgetType.Huddle,
        displayName: t('widgets.huddle.quickActionTitle'),
        accessoryData: {
          topic: '',
          emoji: 'speech_bubble',
        },
        size: INITIAL_SIZE,
        confidence: 5,
      },
    ];
  }

  return [];
}
