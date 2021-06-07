export enum MeetingType {
  CUSTOM = 'CUSTOM',
  STAND_UP = 'STAND_UP',
  WORKSHOP = 'WORKSHOP',
  PRESENTATION = 'PRESENTATION',
  ONE_ON_ONE = 'ONE_ON_ONE',
  TEAM_RETROSPECTIVE = 'TEAM_RETROSPECTIVE',
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
