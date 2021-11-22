import { TFunction } from 'i18next';
import { WidgetType } from '@api/roomState/types/widgets';
import { isSmallScreen } from '@utils/environment';
import { INITIAL_SIZE } from '../../room/widgets/stickyNote/constants';
import { QuickAction, QuickActionKind } from '../types';

export function stickyNoteQuickActions(prompt: string, t: TFunction): QuickAction[] {
  // empty default actions are only on mobile right now
  if (!prompt && isSmallScreen()) {
    // this accessory shows a default option in the empty state
    return [
      {
        kind: QuickActionKind.AddAccessory,
        icon: WidgetType.StickyNote,
        accessoryType: WidgetType.StickyNote,
        displayName: t('widgets.stickyNote.quickActionTitle'),
        accessoryData: {
          text: '',
        },
        size: INITIAL_SIZE,
        confidence: 5,
      },
    ];
  } else if (!!prompt) {
    // any text can be added to a sticky note.
    return [
      {
        kind: QuickActionKind.AddAccessory,
        icon: WidgetType.StickyNote,
        accessoryType: WidgetType.StickyNote,
        displayName: t('widgets.stickyNote.quickActionTitle'),
        accessoryData: {
          text: prompt,
        },
        size: INITIAL_SIZE,
        confidence: 2,
      },
    ];
  }

  return [];
}
