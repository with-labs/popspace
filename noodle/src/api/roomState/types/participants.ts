export interface ActorShape {
  id: string;
  displayName: string;
  avatarName: string;
}

export interface ParticipantState {
  /** Do not disturb: media is off and the user hears nobody */
  doNotDisturb?: boolean;
}

export interface ParticipantShape {
  /** Represents the active client session for this view of the user */
  sessionId: string;
  participantState: ParticipantState;
  actor: ActorShape;
  isObserver: boolean;
}
