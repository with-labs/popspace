import { WhiteboardState } from '../../components/Whiteboard/types';

export enum WidgetType {
  Link = 'LINK',
  StickyNote = 'STICKY_NOTE',
  Whiteboard = 'WHITEBOARD',
  YouTube = 'YOU_TUBE',
  SidecarStream = 'SIDECAR_STREAM',
}

export interface StickyNoteWidgetState {
  text: string;
}

export interface LinkWidgetState {
  url: string;
  title?: string;
  mediaUrl?: string;
  mediaContentType?: string;
  description?: string;
}

export interface WhiteboardWidgetState {
  whiteboardState: WhiteboardState;
}

export interface YoutubeWidgetState {
  timestamp?: number;
  /**
   * If the video is currently playing,
   * this records when it started. The client can use
   * this to compute a more exact timestamp, by adding
   * the elapsed time since play started to the recorded
   * timestamp.
   */
  playStartedTimestampUTC: string | null;
  isPlaying?: boolean;
  videoId: string;
}

// nothing yet.
export interface SidecarStreamWidgetState {
  twilioParticipantIdentity: string;
  videoTrackName?: string;
  audioTrackName?: string;
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

export type WidgetShape = Unionize<WidgetShapeTable>;

export type WidgetState = WidgetShape['widgetState'];
