import { WhiteboardState } from '@components/Whiteboard/types';
import { ThemeName } from '@src/theme/theme';
import { TrackType } from '@withso/pop-media-sdk';

// eslint-disable-next-line no-shadow
export enum WidgetType {
  Link = 'LINK',
  StickyNote = 'STICKY_NOTE',
  Whiteboard = 'WHITEBOARD',
  YouTube = 'YOU_TUBE',
  Notepad = 'NOTEPAD',
  SidecarStream = 'SIDECAR_STREAM',
  Huddle = 'HUDDLE',
  File = 'FILE',
  Chat = 'CHAT',
  // not used by end-users - this is just for demos
  MockUser = 'MOCK_USER',
}

/**
 * A common data interface related to media playback which
 * is synchronized between peers
 */
export interface WidgetMediaState {
  timestamp?: number;
  /**
   * If the media is currently playing,
   * this records when it started. The client can use
   * this to compute a more exact timestamp, by adding
   * the elapsed time since play started to the recorded
   * timestamp.
   */
  playStartedTimestampUtc: string | null;
  isPlaying?: boolean;
  isRepeatOn?: boolean;
  /** 0-1 */
  volume?: number;
}

export interface StickyNoteWidgetState {
  title?: string;
  text: string;
  color?: ThemeName;
}

export interface LinkWidgetState {
  url: string;
  title?: string;
  iconUrl?: string | null;
  /**
   * Should everyone see this link as an iframe?
   */
  showIframe?: boolean;
  /**
   * If the link has any embeddable content, this property will
   * be the URL to provide to the iframe.
   */
  iframeUrl?: string | null;
}

export interface FileWidgetState {
  url: string;
  fileName: string;
  fileId: string;
  contentType: string;
  uploadProgress: number;
  mediaState?: WidgetMediaState;
}

export interface ChatWidgetState {
  title?: string;
  color?: ThemeName;
}
export interface ChatMessageShape {
  id: string;
  content: string;
  sender: {
    id: string;
    displayName: string;
  };
  createdAt: string;
}

export interface NotepadState {
  docId: string;
  initialData?: null | any;
  title?: string;
  color?: ThemeName;
}

export interface WhiteboardWidgetState {
  whiteboardState: WhiteboardState;
}

export interface YoutubeWidgetState {
  mediaState?: WidgetMediaState;
  videoId: string;
}

// nothing yet.
export interface SidecarStreamWidgetState {
  mediaParticipantId: string;
  videoTrackType?: TrackType;
  audioTrackType?: TrackType;
}

export interface MockUserWidgetState {
  displayName: string;
  video: string;
}

export interface HuddleWidgetState {
  title?: string;
  color?: ThemeName;
}

/** Common properties to all widgets */
export interface BaseWidgetShape {
  widgetId: string;
  creatorId: string;
  creatorDisplayName: string;
}

// FIXME: can this be automatically created using TypeScript generics?
export type WidgetStateByType = {
  [WidgetType.StickyNote]: StickyNoteWidgetState;
  [WidgetType.Link]: LinkWidgetState;
  [WidgetType.Whiteboard]: WhiteboardWidgetState;
  [WidgetType.Notepad]: NotepadState;
  [WidgetType.YouTube]: YoutubeWidgetState;
  [WidgetType.SidecarStream]: SidecarStreamWidgetState;
  [WidgetType.MockUser]: MockUserWidgetState;
  [WidgetType.Huddle]: HuddleWidgetState;
  [WidgetType.File]: FileWidgetState;
  [WidgetType.Chat]: ChatWidgetState;
};
export type WidgetShapeByType = {
  [WidgetType.StickyNote]: BaseWidgetShape & {
    widgetState: StickyNoteWidgetState;
  };
  [WidgetType.Link]: BaseWidgetShape & {
    widgetState: LinkWidgetState;
  };
  [WidgetType.Whiteboard]: BaseWidgetShape & {
    widgetState: WhiteboardWidgetState;
  };
  [WidgetType.Notepad]: BaseWidgetShape & {
    widgetState: NotepadState;
  };
  [WidgetType.YouTube]: BaseWidgetShape & {
    widgetState: YoutubeWidgetState;
  };
  [WidgetType.SidecarStream]: BaseWidgetShape & {
    widgetState: SidecarStreamWidgetState;
  };
  [WidgetType.MockUser]: BaseWidgetShape & {
    widgetState: MockUserWidgetState;
  };
  [WidgetType.Huddle]: BaseWidgetShape & {
    widgetState: HuddleWidgetState;
  };
  [WidgetType.File]: BaseWidgetShape & {
    widgetState: FileWidgetState;
  };
  [WidgetType.Chat]: BaseWidgetShape & {
    widgetState: ChatWidgetState;
    messages: {
      hasMoreToLoad: boolean;
      messageList: ChatMessageShape[];
    };
  };
};
export type WidgetShapeForType<T extends WidgetType> = WidgetShapeTable[T];

type TagWithKey<TagName extends string, T> = {
  [K in keyof T]: { [_ in TagName]: K } & T[K];
};

type Unionize<T> = T[keyof T];

type WidgetShapeTable = TagWithKey<'type', WidgetShapeByType>;

export type LinkWidgetShape = WidgetShapeTable[WidgetType.Link];
export type StickyNoteWidgetShape = WidgetShapeTable[WidgetType.StickyNote];
export type WhiteboardWidgetShape = WidgetShapeTable[WidgetType.Whiteboard];
export type YoutubeWidgetShape = WidgetShapeTable[WidgetType.YouTube];
export type ScreenShareWidgetShape = WidgetShapeTable[WidgetType.SidecarStream];
export type MockUserWidgetShape = WidgetShapeTable[WidgetType.MockUser];
export type HuddleWidgetShape = WidgetShapeTable[WidgetType.Huddle];
export type FileWidgetShape = WidgetShapeTable[WidgetType.File];
export type ChatWidgetShape = WidgetShapeTable[WidgetType.Chat];

export type WidgetShape = Unionize<WidgetShapeTable>;

export type WidgetState = WidgetShape['widgetState'];
