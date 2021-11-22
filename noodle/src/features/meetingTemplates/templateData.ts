import oneOnOneImg from '@images/illustrations/meeting_templates/template_1on1.png';
import allHandsImg from '@images/illustrations/meeting_templates/template_allHands.png';
import blankImg from '@images/illustrations/meeting_templates/template_blank.png';
import brainstormImg from '@images/illustrations/meeting_templates/template_brainstorm.png';
import dailyImg from '@images/illustrations/meeting_templates/template_daily.png';
import happyHourImg from '@images/illustrations/meeting_templates/template_happyHour.png';
import remoteInterviewImg from '@images/illustrations/meeting_templates/template_interview.png';
import retrospectiveImg from '@images/illustrations/meeting_templates/template_retrospective.png';
import weeklyImg from '@images/illustrations/meeting_templates/template_weekly.png';

export enum MeetingTemplateName {
  Blank = 'new',
  Daily = 'daily',
  Weekly = 'weekly',
  OneOnOne = 'one_on_one',
  AllHands = 'all_hands',
  Retrospective = 'retrospective',
  RemoteInterview = 'remote_interview',
  HappyHour = 'happy_hour',
  Brainstorm = 'brainstorm',
}

export const templateMetadata: Record<MeetingTemplateName, { i18nKey: string; image: string }> = {
  [MeetingTemplateName.Blank]: {
    i18nKey: 'meetingTemplates.blank',
    image: blankImg,
  },
  [MeetingTemplateName.Daily]: {
    i18nKey: 'meetingTemplates.daily',
    image: dailyImg,
  },
  [MeetingTemplateName.Weekly]: {
    i18nKey: 'meetingTemplates.weekly',
    image: weeklyImg,
  },
  [MeetingTemplateName.OneOnOne]: {
    i18nKey: 'meetingTemplates.oneOnOne',
    image: oneOnOneImg,
  },
  [MeetingTemplateName.AllHands]: {
    i18nKey: 'meetingTemplates.allHands',
    image: allHandsImg,
  },
  [MeetingTemplateName.Retrospective]: {
    i18nKey: 'meetingTemplates.retrospective',
    image: retrospectiveImg,
  },
  [MeetingTemplateName.RemoteInterview]: {
    i18nKey: 'meetingTemplates.interview',
    image: remoteInterviewImg,
  },
  [MeetingTemplateName.HappyHour]: {
    i18nKey: 'meetingTemplates.happyHour',
    image: happyHourImg,
  },
  [MeetingTemplateName.Brainstorm]: {
    i18nKey: 'meetingTemplates.brainstorm',
    image: brainstormImg,
  },
};
