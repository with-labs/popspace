import { TFunction } from 'i18next';
import { featureFlags } from '../../../featureFlags';
import { WidgetType } from '@api/roomState/types/widgets';
import { INITIAL_SIZE_VIDEO } from '../../room/people/constants';
import { QuickAction, QuickActionKind } from '../types';

export function mockUserQuickActions(prompt: string, t: TFunction): QuickAction[] {
  const hasMockUsers = featureFlags.get('mockUsers');

  if (!hasMockUsers) return [];

  if (prompt && prompt === 'mockuser') {
    return [
      {
        kind: QuickActionKind.AddAccessory,
        icon: WidgetType.StickyNote,
        accessoryData: {
          displayName: '',
          video: '',
          muted: false,
        },
        accessoryType: WidgetType.MockUser,
        confidence: 10,
        displayName: 'Add mock user',
        size: INITIAL_SIZE_VIDEO,
      },
    ];
  }

  return [];
}
