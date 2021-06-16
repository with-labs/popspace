import customData from '@features/meetingTemplates/templateData/custom.json';
import oneOnOneData from '@features/meetingTemplates/templateData/oneOnOne.json';
import presentationData from '@features/meetingTemplates/templateData/presentation.json';
import retrospectiveData from '@features/meetingTemplates/templateData/retrospective.json';
import standupData from '@features/meetingTemplates/templateData/standup.json';
import workshopData from '@features/meetingTemplates/templateData/workshop.json';

import customImg from '@images/illustrations/meeting_templates/custom.png';
import oneOnOneImg from '@images/illustrations/meeting_templates/one_on_one.png';
import presentationImg from '@images/illustrations/meeting_templates/presentation.png';
import retrospectiveImg from '@images/illustrations/meeting_templates/retrospective.png';
import standupImg from '@images/illustrations/meeting_templates/standup.png';
import workshopImg from '@images/illustrations/meeting_templates/workshop.png';

export enum MeetingTemplateName {
  Custom = 'custom',
  StandUp = 'stand_up',
  Workshop = 'workshop',
  Presentation = 'presentation',
  OneOnOne = 'one_on_one',
  Retrospective = 'team_retrospective',
}

export const meetingTemplates: Record<MeetingTemplateName, any> = {
  [MeetingTemplateName.Custom]: customData,
  [MeetingTemplateName.Workshop]: workshopData,
  [MeetingTemplateName.OneOnOne]: oneOnOneData,
  [MeetingTemplateName.Presentation]: presentationData,
  [MeetingTemplateName.Retrospective]: retrospectiveData,
  [MeetingTemplateName.StandUp]: standupData,
};

export const templateMetadata: Record<MeetingTemplateName, { i18nKey: string; image: string }> = {
  [MeetingTemplateName.Custom]: {
    i18nKey: 'meetingTemplates.custom',
    image: customImg,
  },
  [MeetingTemplateName.Workshop]: {
    i18nKey: 'meetingTemplates.workshop',
    image: workshopImg,
  },
  [MeetingTemplateName.StandUp]: {
    i18nKey: 'meetingTemplates.standup',
    image: standupImg,
  },
  [MeetingTemplateName.Presentation]: {
    i18nKey: 'meetingTemplates.presentation',
    image: presentationImg,
  },
  [MeetingTemplateName.OneOnOne]: {
    i18nKey: 'meetingTemplates.oneOnOne',
    image: oneOnOneImg,
  },
  [MeetingTemplateName.Retrospective]: {
    i18nKey: 'meetingTemplates.retrospective',
    image: retrospectiveImg,
  },
};
