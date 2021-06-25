export interface ActorShape {
  id: string;
  displayName: string;
  avatarName: string;
}
export interface ParticipantState {
  displayName: string;
  avatarName: string;
}

export interface ParticipantShape {
  /** Represents the active client session for this view of the user */
  sessionId: string;
  participantState: ParticipantState;
  actor: ActorShape;
}
