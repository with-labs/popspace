import { RoomTemplate } from '@roomState/exportRoomTemplate';

import customData from './templateData/custom.json';
import oneOnOneData from './templateData/oneOnOne.json';
import presentationData from './templateData/presentation.json';
import retrospectiveData from './templateData/retrospective.json';
import standupData from './templateData/standup.json';
import workshopData from './templateData/workshop.json';

import customImg from '@images/illustrations/meeting_templates/custom.png';
import oneOnOneImg from '@images/illustrations/meeting_templates/one_on_one.png';
import presentationImg from '@images/illustrations/meeting_templates/presentation.png';
import retrospectiveImg from '@images/illustrations/meeting_templates/retrospective.png';
import standupImg from '@images/illustrations/meeting_templates/standup.png';
import workshopImg from '@images/illustrations/meeting_templates/workshop.png';

export enum MeetingTemplateName {
  Custom = 'Custom',
  StandUp = 'Stand Up',
  Workshop = 'Workshop',
  Presentation = 'Presentation',
  OneOnOne = 'One-on-One',
  Retrospective = 'Team Retrospective',
}

export const meetingTemplates: Record<MeetingTemplateName, RoomTemplate> = {
  [MeetingTemplateName.Custom]: customData as RoomTemplate,
  [MeetingTemplateName.Workshop]: workshopData as RoomTemplate,
  [MeetingTemplateName.OneOnOne]: oneOnOneData as RoomTemplate,
  [MeetingTemplateName.Presentation]: presentationData as RoomTemplate,
  [MeetingTemplateName.Retrospective]: retrospectiveData as RoomTemplate,
  [MeetingTemplateName.StandUp]: standupData as RoomTemplate,
};

export const templateMetadata: Record<
  MeetingTemplateName,
  { descriptionI18nKey: string; image: string; imageAlt: string }
> = {
  [MeetingTemplateName.Custom]: {
    descriptionI18nKey: 'pages.createRoom.meetingTemplate.descriptions.custom',
    image: customImg,
    imageAlt: 'A speech bubble with a friendly exclamation',
  },
  [MeetingTemplateName.Workshop]: {
    descriptionI18nKey: 'pages.createRoom.meetingTemplate.descriptions.workshop',
    image: workshopImg,
    imageAlt: 'A timer on a grid-like abstract background',
  },
  [MeetingTemplateName.StandUp]: {
    descriptionI18nKey: 'pages.createRoom.meetingTemplate.descriptions.standup',
    image: standupImg,
    imageAlt: 'A streaming cup of morning beverage',
  },
  [MeetingTemplateName.Presentation]: {
    descriptionI18nKey: 'pages.createRoom.meetingTemplate.descriptions.presentation',
    image: presentationImg,
    imageAlt: 'A projection screen with an upward-trending graph',
  },
  [MeetingTemplateName.OneOnOne]: {
    descriptionI18nKey: 'pages.createRoom.meetingTemplate.descriptions.oneOnOne',
    image: oneOnOneImg,
    imageAlt: 'Two comfy chairs facing one another',
  },
  [MeetingTemplateName.Retrospective]: {
    descriptionI18nKey: 'pages.createRoom.meetingTemplate.descriptions.retrospective',
    image: retrospectiveImg,
    imageAlt: 'A document being inspected with a magnifying glass',
  },
};
