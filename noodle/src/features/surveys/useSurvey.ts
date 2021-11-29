import client from '@api/client';
import { SurveyResponse } from '@api/subClients/SurveyClient';
import { useLocalStorage } from '@hooks/useLocalStorage/useLocalStorage';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const useSurvey = (surveyName: string) => {
  const [dismissals, setDismissals] = useLocalStorage('surveyDismissals', new Array<string>());

  const isDismissed = dismissals.includes(surveyName);

  const dismissSurvey = useCallback(() => {
    setDismissals((current) => [...current, surveyName]);
  }, [surveyName, setDismissals]);

  const [previousResponse, setPreviousResponse] = useState<SurveyResponse | null>(null);
  const submitSurvey = useCallback(
    async (response: any) => {
      try {
        const { response: result } = await client.surveys.submitResponse(surveyName, response);
        setPreviousResponse(result);
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    [surveyName]
  );

  useEffect(() => {
    client.surveys.getResponse(surveyName).then(({ response }) => setPreviousResponse(response));
  }, [surveyName]);

  return { isDismissed, dismissSurvey, submitSurvey, previousResponse };
};
