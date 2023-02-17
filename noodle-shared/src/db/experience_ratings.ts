import prisma from './prisma';

export class ExperienceRatings {
  createRating(
    actorId: number,
    roomId: number,
    rating: number,
    submittedAt: Date,
    feedback: string | null,
  ) {
    return prisma.experienceRating.create({
      data: {
        actorId,
        roomId,
        submittedAt,
        rating,
        feedback,
      },
    });
  }

  updateRating(
    ratingId: number,
    updates: { rating?: number; feedback?: string },
  ) {
    return prisma.experienceRating.update({
      where: { id: ratingId },
      data: updates,
    });
  }

  getRating(ratingId: number) {
    return prisma.experienceRating.findUnique({
      where: {
        id: ratingId,
      },
    });
  }
}

export default new ExperienceRatings();
