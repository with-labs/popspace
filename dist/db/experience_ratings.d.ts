export declare class ExperienceRatings {
    createRating(actorId: bigint, roomId: bigint, rating: number, submittedAt: Date, feedback: string | null): import(".prisma/client").Prisma.Prisma__ExperienceRatingClient<import(".prisma/client").ExperienceRating>;
    updateRating(ratingId: bigint, updates: {
        rating?: number;
        feedback?: string;
    }): import(".prisma/client").Prisma.Prisma__ExperienceRatingClient<import(".prisma/client").ExperienceRating>;
    getRating(ratingId: bigint): import(".prisma/client").Prisma.Prisma__ExperienceRatingClient<import(".prisma/client").ExperienceRating>;
}
declare const _default: ExperienceRatings;
export default _default;
