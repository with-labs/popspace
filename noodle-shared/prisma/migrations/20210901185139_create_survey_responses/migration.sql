-- CreateTable
CREATE TABLE "survey_responses" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" BIGINT,
    "survey_name" TEXT,
    "response" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "survey_responses" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
