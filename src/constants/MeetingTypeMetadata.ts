export enum MeetingType {
  CUSTOM = 'custom',
  STAND_UP = 'stand_up',
  WORKSHOP = 'workshop',
  PRESENTATION = 'presentation',
  ONE_ON_ONE = 'one_on_one',
  TEAM_RETROSPECTIVE = 'team_retrospective',
}

export type MeetingTypeMetadataType = {
  type: MeetingType;
  coverImg: string;
};

export const MeetingTypeMetadata = [
  {
    type: MeetingType.CUSTOM,
    coverImg: '',
  },
  {
    type: MeetingType.STAND_UP,
    coverImg: '',
  },
  {
    type: MeetingType.WORKSHOP,
    coverImg: '',
  },
  {
    type: MeetingType.PRESENTATION,
    coverImg: '',
  },
  {
    type: MeetingType.ONE_ON_ONE,
    coverImg: '',
  },
  {
    type: MeetingType.TEAM_RETROSPECTIVE,
    coverImg: '',
  },
];
