import { QuickAction, QuickActionKind } from './types';
import { useTranslation } from 'react-i18next';
import { parseYoutubeLink } from '../../../../utils/youtube';
import { WidgetType } from '../../../../roomState/types/widgets';
import { useFeatureFlag } from 'flagg';

function useStickyNoteQuickActions(prompt: string): QuickAction[] {
  const { t } = useTranslation();

  if (!prompt) {
    // this accessory shows a default option in the empty state
    return [
      {
        kind: QuickActionKind.AddAccessory,
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

function useLinkQuickActions(prompt: string): QuickAction[] {
  const { t } = useTranslation();

  if (!prompt) {
    // this accessory shows a default option in the empty state
    return [
      {
        kind: QuickActionKind.AddAccessory,
        accessoryType: WidgetType.Link,
        displayName: t('widgets.link.quickActionTitle'),
        accessoryData: {
          url: '',
          title: 'Link',
        },
        confidence: 5,
      },
    ];
    // excluding starting with #, since that is a valid URL but not
    // probably what the user intended
  } else if (!prompt.startsWith('#')) {
    try {
      // throws if the string is not a valid URL
      new URL(prompt);
      return [
        {
          kind: QuickActionKind.AddAccessory,
          accessoryType: WidgetType.Link,
          displayName: t('widgets.link.quickActionTitle'),
          accessoryData: {
            url: prompt,
            title: prompt,
          },
          confidence: 8,
        },
      ];
    } catch (err) {
      // it's not a link verbatim, check more options below
    }
  }

  const iframeMatch = /^<iframe .*src="(.+?)".*<\/iframe>$/.exec(prompt);
  if (iframeMatch) {
    const src = iframeMatch[1];
    try {
      new URL(src);
      return [
        {
          kind: QuickActionKind.AddAccessory,
          accessoryType: WidgetType.Link,
          displayName: t('widgets.link.quickActionAddEmbed'),
          accessoryData: {
            url: src,
            title: t('widgets.link.embedTitle'),
            iframeUrl: src,
            showIframe: true,
          },
          confidence: 8,
        },
      ];
    } catch (err) {
      // malformed iframe tag, keep going below.
    }
  }

  return [];
}

function useYoutubeQuickActions(prompt: string): QuickAction[] {
  const { t } = useTranslation();

  if (!prompt) {
    // this accessory shows a default option in the empty state
    return [
      {
        kind: QuickActionKind.AddAccessory,
        accessoryType: WidgetType.YouTube,
        displayName: t('widgets.youtube.quickActionTitle'),
        accessoryData: {
          videoId: null,
          mediaState: {
            playStartedTimestampUTC: null,
          },
        },
        confidence: 5,
      },
    ];
  } else {
    const parsed = parseYoutubeLink(prompt);

    if (parsed) {
      return [
        {
          kind: QuickActionKind.AddAccessory,
          accessoryType: WidgetType.YouTube,
          displayName: t('widgets.youtube.quickActionTitle'),
          accessoryData: {
            videoId: parsed.videoId,
            mediaState: {
              timestamp: parsed.timestamp || parsed.start || 0,
              isPlaying: true,
              playStartedTimestampUTC: new Date().toUTCString(),
            },
          },
          confidence: 10,
        },
      ];
    }
  }

  return [];
}

function useWhiteboardQuickActions(prompt: string): QuickAction[] {
  const { t } = useTranslation();

  if (!prompt || prompt === t('widgets.whiteboard.quickActionPrompt')) {
    return [
      {
        kind: QuickActionKind.AddAccessory,
        accessoryType: WidgetType.Whiteboard,
        accessoryData: {
          whiteboardState: {
            lines: [],
          },
        },
        // for empty, it's 5 - for /whiteboard, it's 10
        confidence: !prompt ? 5 : 10,
        displayName: t('widgets.whiteboard.quickActionTitle'),
      },
    ];
  }

  return [];
}

function useStatusQuickActions(prompt: string): QuickAction[] {
  const { t } = useTranslation();

  if (!!prompt) {
    return [
      {
        kind: QuickActionKind.SetStatus,
        status: prompt.trim(),
        displayName: t('features.status.quickActionTitle'),
        confidence: 1,
      },
    ];
  }

  return [];
}

function useMockuserQuickActions(prompt: string): QuickAction[] {
  const [hasMockUsers] = useFeatureFlag('mockUsers');

  if (!hasMockUsers) return [];

  if (prompt && prompt === 'mockuser') {
    return [
      {
        kind: QuickActionKind.AddAccessory,
        accessoryData: {
          displayName: '',
          video: '',
          muted: false,
        },
        accessoryType: WidgetType.MockUser,
        confidence: 10,
        displayName: 'Add mock user',
      },
    ];
  }

  return [];
}

/**
 * This function processes the input the user typed and
 * determines which actions are available, as well as what
 * metadata will be associated with those actions.
 */
export function useQuickActionOptions(prompt: string): QuickAction[] {
  const trimmed = prompt.trim();
  return [
    ...useStickyNoteQuickActions(trimmed),
    ...useLinkQuickActions(trimmed),
    ...useYoutubeQuickActions(trimmed),
    ...useStatusQuickActions(trimmed),
    ...useWhiteboardQuickActions(trimmed),
    ...useMockuserQuickActions(trimmed),
  ].sort((a, b) => b.confidence - a.confidence);
}
