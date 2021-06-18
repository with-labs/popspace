import { ApiSubClient } from './ApiSubClient';

export class ExperienceRatingClient extends ApiSubClient {
  submitExperienceRating = async (data: { rating: number; roomRoute: string; feedback?: string }) => {
    return this.core.post<{ ratingId: number; rating: number; feedback?: string }>(
      '/submit_experience_rating',
      data,
      this.core.SERVICES.api
    );
  };

  async updateExperienceRating(data: { ratingId: number; rating?: number; feedback?: string }) {
    return this.core.post<{ ratingId: number; rating: number; feedback?: string }>(
      '/update_experience_rating',
      data,
      this.core.SERVICES.api
    );
  }
}
