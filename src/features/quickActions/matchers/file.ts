import { TFunction } from 'i18next';
import { isSmallScreen } from '@utils/environment';
import { QuickAction, QuickActionKind } from '../types';

export function fileQuickActions(prompt: string, t: TFunction): QuickAction[] {
  // empty default actions are only on mobile right now
  if (!prompt && isSmallScreen()) {
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
