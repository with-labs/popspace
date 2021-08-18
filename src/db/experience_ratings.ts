import prisma from './prisma';

export class ExperienceRatings {
  createRating(
    actorId: bigint,
    roomId: bigint,
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
    ratingId: bigint,
    updates: { rating?: number; feedback?: string },
  ) {
    return prisma.experienceRating.update({
      where: { id: ratingId },
      data: updates,
    });
  }

  getRating(ratingId: bigint) {
    return prisma.experienceRating.findUnique({
      where: {
        id: ratingId,
      },
    });
  }
}

export default new ExperienceRatings();
