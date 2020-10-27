import { QuickAction, QuickActionKind } from './types';
import { useTranslation } from 'react-i18next';
import useParticipantDisplayIdentity from '../../../../../hooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import { useLocalParticipant } from '../../../../../hooks/useLocalParticipant/useLocalParticipant';
import { WidgetType } from '../../../../../types/room';
import { parseYoutubeLink } from '../../../../../utils/youtube';

function useStickyNoteQuickActions(prompt: string): QuickAction[] {
  const { t } = useTranslation();

  // TODO: remove once we solve the username disappearing problem
  // by persisting room state and membership
  const userName = useParticipantDisplayIdentity(useLocalParticipant());

  if (!!prompt) {
    // any text can be added to a sticky note.
    return [
      {
        kind: QuickActionKind.AddAccessory,
        accessoryType: WidgetType.StickyNote,
        displayName: t('widgets.stickyNote.quickActionTitle'),
        accessoryData: {
          text: prompt,
          author: userName || '',
        },
        confidence: 1,
      },
    ];
  }

  return [];
}

function useLinkQuickActions(prompt: string): QuickAction[] {
  const { t } = useTranslation();

  if (!!prompt) {
    try {
      const trimmed = prompt.trim();
      // throws if the string is not a valid URL
      new URL(trimmed);
      return [
        {
          kind: QuickActionKind.AddAccessory,
          accessoryType: WidgetType.Link,
          displayName: t('widgets.link.quickActionTitle'),
          accessoryData: {
            url: trimmed,
            title: trimmed,
          },
          confidence: 8,
        },
      ];
    } catch (err) {
      return [];
    }
  }

  return [];
}

function useYoutubeQuickActions(prompt: string): QuickAction[] {
  const { t } = useTranslation();

  if (!!prompt) {
    const parsed = parseYoutubeLink(prompt);

    if (parsed) {
      return [
        {
          kind: QuickActionKind.AddAccessory,
          accessoryType: WidgetType.YouTube,
          displayName: t('widgets.youtube.quickActionTitle'),
          accessoryData: {
            videoId: parsed.videoId,
            timestamp: parsed.timestamp || parsed.start || 0,
            isPlaying: true,
            playStartedTimestampUTC: new Date().toUTCString(),
          },
          confidence: 10,
        },
      ];
    }
  }

  return [];
}

/**
 * This function processes the input the user typed and
 * determines which actions are available, as well as what
 * metadata will be associated with those actions.
 */
export function useQuickActionOptions(prompt: string): QuickAction[] {
  return [...useStickyNoteQuickActions(prompt), ...useLinkQuickActions(prompt), ...useYoutubeQuickActions(prompt)].sort(
    (a, b) => b.confidence - a.confidence
  );
}
