export interface UserShape {
  id: string;
}

export interface ParticipantState {
  avatarName: string;
  displayName: string;
  statusText: string | null;
  emoji: string | null;
  isAway: boolean;
}

export interface ParticipantShape {
  /** Represents the active client session for this view of the user */
  sessionId: string;
  /** Is the user a With registered user or anonymous? */
  authenticated: boolean;
  /** With user data */
  user: UserShape;
  participantState: ParticipantState;
}
