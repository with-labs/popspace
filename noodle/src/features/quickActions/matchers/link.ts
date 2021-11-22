import { TFunction } from 'i18next';
import { WidgetType } from '@api/roomState/types/widgets';
import { isSmallScreen } from '@utils/environment';
import { INITIAL_SIZE_EDIT, INITIAL_SIZE_FRAME, SIZE_STUB } from '../../room/widgets/link/constants';
import { QuickAction, QuickActionKind } from '../types';

export function linkQuickActions(prompt: string, t: TFunction): QuickAction[] {
  // empty default actions are only on mobile right now
  if (!prompt && isSmallScreen()) {
    // this accessory shows a default option in the empty state
    return [
      {
        kind: QuickActionKind.AddAccessory,
        icon: WidgetType.Link,
        accessoryType: WidgetType.Link,
        displayName: t('widgets.link.quickActionTitle'),
        accessoryData: {
          url: '',
          title: 'Link',
        },
        size: INITIAL_SIZE_EDIT,
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
          icon: WidgetType.Link,
          accessoryType: WidgetType.Link,
          displayName: t('widgets.link.quickActionTitle'),
          accessoryData: {
            url: prompt,
            title: prompt,
          },
          size: SIZE_STUB,
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
          icon: 'embed',
          accessoryType: WidgetType.Link,
          displayName: t('widgets.link.quickActionAddEmbed'),
          accessoryData: {
            url: src,
            title: t('widgets.link.embedTitle'),
            iframeUrl: src,
            showIframe: true,
          },
          size: INITIAL_SIZE_FRAME,
          confidence: 8,
        },
      ];
    } catch (err) {
      // malformed iframe tag, keep going below.
    }
  }

  return [];
}
