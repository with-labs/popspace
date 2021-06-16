export interface ActorShape {
  id: string;
}
export interface ParticipantState {
  avatarName: string;
  displayName: string;
}

export interface ParticipantShape {
  /** Represents the active client session for this view of the user */
  sessionId: string;
  participantState: ParticipantState;
}
