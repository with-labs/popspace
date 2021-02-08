import { TFunction } from 'i18next';
import { QuickAction, QuickActionKind } from '../types';

export function fileQuickActions(prompt: string, t: TFunction): QuickAction[] {
  if (!prompt) {
    // for empty quick action bar, show an option to add a file
    return [
      {
        kind: QuickActionKind.AddFile,
        icon: 'file',
        confidence: 5,
        displayName: t('widgets.link.quickActionAddFile'),
      },
    ];
  }

  return [];
}
