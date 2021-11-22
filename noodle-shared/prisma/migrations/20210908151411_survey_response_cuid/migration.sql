/*
  Warnings:

  - The primary key for the `survey_responses` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "survey_responses" DROP CONSTRAINT "survey_responses_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD PRIMARY KEY ("id");
DROP SEQUENCE "survey_responses_id_seq";
