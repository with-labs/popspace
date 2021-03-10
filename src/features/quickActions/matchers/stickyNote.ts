import { TFunction } from 'i18next';
import { WidgetType } from '../../../roomState/types/widgets';
import { isSmallScreen } from '../../../utils/environment';
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
        confidence: 5,
      },
    ];
  } else {
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
        confidence: 2,
      },
    ];
  }
}
