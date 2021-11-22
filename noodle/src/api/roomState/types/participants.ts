export interface ActorShape {
  id: string;
  displayName: string;
  avatarName: string;
}

/** Empty... for now. */
export interface ParticipantState {}

export interface ParticipantShape {
  /** Represents the active client session for this view of the user */
  sessionId: string;
  participantState: ParticipantState;
  actor: ActorShape;
  isObserver: boolean;
}
