"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperienceRatings = void 0;
var prisma_1 = __importDefault(require("./prisma"));
var ExperienceRatings = /** @class */ (function () {
    function ExperienceRatings() {
    }
    ExperienceRatings.prototype.createRating = function (actorId, roomId, rating, submittedAt, feedback) {
        return prisma_1.default.experienceRating.create({
            data: {
                actorId: actorId,
                roomId: roomId,
                submittedAt: submittedAt,
                rating: rating,
                feedback: feedback,
            },
        });
    };
    ExperienceRatings.prototype.updateRating = function (ratingId, updates) {
        return prisma_1.default.experienceRating.update({
            where: { id: ratingId },
            data: updates,
        });
    };
    ExperienceRatings.prototype.getRating = function (ratingId) {
        return prisma_1.default.experienceRating.findUnique({
            where: {
                id: ratingId,
            },
        });
    };
    return ExperienceRatings;
}());
exports.ExperienceRatings = ExperienceRatings;
exports.default = new ExperienceRatings();
