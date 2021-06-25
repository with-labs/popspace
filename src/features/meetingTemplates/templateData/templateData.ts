import blankData from './blank.json';
import dailyData from './daily.json';
import weeklyData from './weekly.json';
import oneOnOneData from './oneOnOne.json';
import allHandsData from './allHands.json';
import retrospectiveData from './retrospective.json';
import remoteInterviewData from './remoteInterview.json';
import happyHourData from './happyHour.json';
import brainstormData from './brainstorm.json';

import blankImg from '@images/illustrations/meeting_templates/template_blank.png';
import dailyImg from '@images/illustrations/meeting_templates/template_daily.png';
import weeklyImg from '@images/illustrations/meeting_templates/template_weekly.png';
import oneOnOneImg from '@images/illustrations/meeting_templates/template_1on1.png';
import allHandsImg from '@images/illustrations/meeting_templates/template_allHands.png';
import retrospectiveImg from '@images/illustrations/meeting_templates/template_retrospective.png';
import remoteInterviewImg from '@images/illustrations/meeting_templates/template_interview.png';
import happyHourImg from '@images/illustrations/meeting_templates/template_happyHour.png';
import brainstormImg from '@images/illustrations/meeting_templates/template_brainstorm.png';

export enum MeetingTemplateName {
  Blank = 'blank',
  Daily = 'daily',
  Weekly = 'weekly',
  OneOnOne = 'one_on_one',
  AllHands = 'all_hands',
  Retrospective = 'retrospective',
  RemoteInterview = 'remote_interview',
  HappyHour = 'happy_hour',
  Brainstorm = 'brainstorm',
}

export const meetingTemplates: Record<MeetingTemplateName, any> = {
  [MeetingTemplateName.Blank]: blankData,
  [MeetingTemplateName.Daily]: dailyData,
  [MeetingTemplateName.Weekly]: weeklyData,
  [MeetingTemplateName.OneOnOne]: oneOnOneData,
  [MeetingTemplateName.AllHands]: allHandsData,
  [MeetingTemplateName.Retrospective]: retrospectiveData,
  [MeetingTemplateName.RemoteInterview]: remoteInterviewData,
  [MeetingTemplateName.HappyHour]: happyHourData,
  [MeetingTemplateName.Brainstorm]: brainstormData,
};

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
