import { TFunction } from 'i18next';
import { WidgetType } from '@api/roomState/types/widgets';
import { isSmallScreen } from '@utils/environment';
import { SIZE } from '../../room/widgets/whiteboard/constants';
import { QuickAction, QuickActionKind } from '../types';

export function whiteboardQuickActions(prompt: string, t: TFunction): QuickAction[] {
  // empty default actions are only on mobile right now
  if ((!prompt && isSmallScreen()) || prompt === t('widgets.whiteboard.quickActionPrompt')) {
    return [
      {
        kind: QuickActionKind.AddAccessory,
        icon: WidgetType.Whiteboard,
        accessoryType: WidgetType.Whiteboard,
        accessoryData: {
          whiteboardState: {
            lines: [],
          },
        },
        size: SIZE,
        // for empty, it's 5 - for /whiteboard, it's 10
        confidence: !prompt ? 5 : 10,
        displayName: t('widgets.whiteboard.quickActionTitle'),
      },
    ];
  }

  return [];
}
