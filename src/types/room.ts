import { EmojiData } from 'emoji-mart';

/**
 * Various kinds of things that can be in rooms
 */
export type PersonState = {
  id: string;
  kind: 'person';
  avatar: string;
  emoji: EmojiData | null | string;
  isSpeaking: boolean;
  // FIXME: this seems like user preferences not participant data
  viewingScreenSid: string | null;
};

/** Data common to all types of widgets */
type BaseWidgetState = {
  id: string;
  kind: 'widget';
  participantSid: string;
  isDraft: boolean;
};

// Below are types for our supported widgets, which are
// combined into a discriminated union to support strong
// type checking based on the type field.

export enum WidgetType {
  Link = 'LINK',
  StickyNote = 'STICKY_NOTE',
  Whiteboard = 'WHITEBOARD',
  YouTube = 'YOU_TUBE',
}

export type LinkWidgetState = BaseWidgetState & {
  type: WidgetType.Link;
  data: LinkWidgetData;
};
export type LinkWidgetData = {
  title: string;
  url: string;
};

export type StickyNoteWidgetState = BaseWidgetState & {
  type: WidgetType.StickyNote;
  data: StickyNoteWidgetData;
};
export type StickyNoteWidgetData = {
  text: string;
  /**
   * This is a temporary measure until we get persistence,
   * because participantSid won't be consistent across refreshes
   * for users yet - so we store the author name explicitly.
   * TODO: remove when persistence is in place, using the
   * creator's ID to look up their name.
   */
  author: string;
};

export type WhiteboardWidgetState = BaseWidgetState & {
  type: WidgetType.Whiteboard;
  data: WhiteboardWidgetData;
};
export type WhiteboardWidgetData = {
  // corresponds to a session on witeboard.com
  whiteboardId: string;
};

export type YoutubeWidgetState = BaseWidgetState & {
  type: WidgetType.YouTube;
  data: YoutubeWidgetData;
};
export type YoutubeWidgetData = {
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
};

export type WidgetState = LinkWidgetState | StickyNoteWidgetState | WhiteboardWidgetState | YoutubeWidgetState;
export type WidgetData = LinkWidgetData | StickyNoteWidgetData | WhiteboardWidgetData | YoutubeWidgetData;

export type RoomEntity = PersonState | WidgetState;
export type RoomEntityKind = RoomEntity['kind'];
