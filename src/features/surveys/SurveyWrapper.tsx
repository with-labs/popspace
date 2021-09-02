import { isMobile } from '@utils/environment';
import * as React from 'react';

import { useSurvey } from './useSurvey';
import { useUserStats } from './useUserStats';

export interface SurveyProps {
  surveyName: string;
  /** Defaults to 5 */
  visitCountRequired?: number;
  platform?: 'mobile' | 'desktop' | 'all';
  children: React.ReactNode;
  keepOpenOnSubmit?: boolean;
}

/**
 * Wraps a survey, only showing it if the user has met some
 * criteria to be able to see it and they haven't seen it before.
 */
export function SurveyWrapper({
  surveyName,
  visitCountRequired = 5,
  platform = 'all',
  children,
  keepOpenOnSubmit = false,
}: SurveyProps) {
  const { isDismissed, previousResponse } = useSurvey(surveyName);
  const [userStats] = useUserStats();

  // use all available data to determine whether to present the survey:
  // - if the platform matches
  // - if it's not previously dismissed
  // - if the user hasn't already completed it
  // - if the user has visited the app enough times
  const matchesPlatform =
    platform === 'all' || (isMobile() && platform === 'mobile') || (!isMobile() && platform === 'desktop');

  const provisionallyHidden =
    !matchesPlatform || isDismissed || !!previousResponse || userStats.count < visitCountRequired;

  // to correctly implement keepOpenOnSubmit, we don't want to open the survey on subsequent
  // visits after a submit - only if it was originally open this visit. This flag keeps track
  // of that state.
  const { current: wasHiddenOnMount } = React.useRef(provisionallyHidden);
  // if the survey was visible on mount and the user has submitted a response since,
  // we keep the survey open if keepOpenOnSubmit is true
  const hasPreviousResponseAndIsNotKeptOpen = !!previousResponse && !(keepOpenOnSubmit && !wasHiddenOnMount);
  // hide if the survey matches hidden criteria or if the user has submitted a response and keepOpenOnSubmit case doesn't match
  const isHidden = provisionallyHidden || hasPreviousResponseAndIsNotKeptOpen;

  if (isHidden) {
    return null;
  }

  return <>{children}</>;
}
