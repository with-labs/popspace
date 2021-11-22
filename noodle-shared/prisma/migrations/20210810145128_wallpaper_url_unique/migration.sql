/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `wallpapers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "wallpapers.url_unique" ON "wallpapers"("url");
