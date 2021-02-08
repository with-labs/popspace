import { TFunction } from 'i18next';
import { QuickAction, QuickActionKind } from '../types';

export function statusQuickActions(prompt: string, t: TFunction): QuickAction[] {
  if (!!prompt) {
    return [
      {
        kind: QuickActionKind.SetStatus,
        icon: 'status',
        status: prompt.trim(),
        displayName: t('features.status.quickActionTitle'),
        confidence: 1,
      },
    ];
  }

  return [];
}
