import { WhiteboardState } from '@components/Whiteboard/types';
import { ThemeName } from '../../theme/theme';

// eslint-disable-next-line no-shadow
export enum WidgetType {
  Link = 'LINK',
  StickyNote = 'STICKY_NOTE',
  Whiteboard = 'WHITEBOARD',
  YouTube = 'YOU_TUBE',
  SidecarStream = 'SIDECAR_STREAM',
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
}

export interface StickyNoteWidgetState {
  text: string;
  color?: ThemeName;
}

export interface LinkWidgetState {
  url: string;
  title?: string;
  iconUrl?: string | null;
  mediaUrl?: string;
  mediaContentType?: string;
  /**
   * Percentage progress of upload, from 0-100
   */
  uploadProgress?: number;
  /**
   * Should everyone see this link as an iframe?
   */
  showIframe?: boolean;
  /**
   * If the link has any embeddable content, this property will
   * be the URL to provide to the iframe.
   */
  iframeUrl?: string | null;
  mediaState?: WidgetMediaState;
  /**
   * Indicates this is a file uploaded from With.
   * This just keeps things straight.
   */
  isFileUpload?: boolean;
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
  twilioParticipantIdentity: string;
  videoTrackName?: string;
  audioTrackName?: string;
}

export interface MockUserWidgetState {
  displayName: string;
  video: string;
}

/** Common properties to all widgets */
export interface BaseWidgetShape {
  widgetId: string;
  ownerId: string;
  ownerDisplayName: string;
}

// FIXME: can this be automatically created using TypeScript generics?
export type WidgetStateByType = {
  [WidgetType.StickyNote]: StickyNoteWidgetState;
  [WidgetType.Link]: LinkWidgetState;
  [WidgetType.Whiteboard]: WhiteboardWidgetState;
  [WidgetType.YouTube]: YoutubeWidgetState;
  [WidgetType.SidecarStream]: SidecarStreamWidgetState;
  [WidgetType.MockUser]: MockUserWidgetState;
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
  [WidgetType.YouTube]: BaseWidgetShape & {
    widgetState: YoutubeWidgetState;
  };
  [WidgetType.SidecarStream]: BaseWidgetShape & {
    widgetState: SidecarStreamWidgetState;
  };
  [WidgetType.MockUser]: BaseWidgetShape & {
    widgetState: MockUserWidgetState;
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

export type WidgetShape = Unionize<WidgetShapeTable>;

export type WidgetState = WidgetShape['widgetState'];
