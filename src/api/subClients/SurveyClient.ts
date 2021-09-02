import { ApiSubClient } from './ApiSubClient';

export interface SurveyResponse {
  id: string;
  surveyName: string;
  response: any;
  actorId: string;
  createdAt: string;
  updatedAt: string;
}

export class SurveyClient extends ApiSubClient {
  submitResponse = (surveyName: string, response: any) => {
    return this.core.post<{ response: SurveyResponse }>(
      `/respond_to_survey`,
      { surveyName, response },
      this.core.SERVICES.api
    );
  };

  getResponses = () => {
    return this.core.get<{ responses: SurveyResponse[] }>(`/survey_responses`, this.core.SERVICES.api);
  };

  getResponse = (surveyName: string) => {
    return this.core.get<{ response: SurveyResponse }>(
      `/survey_response?surveyName=${surveyName}`,
      this.core.SERVICES.api
    );
  };
}
