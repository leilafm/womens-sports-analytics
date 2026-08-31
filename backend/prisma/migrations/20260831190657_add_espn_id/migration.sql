/*
  Warnings:

  - A unique constraint covering the columns `[espnId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `espnId` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "espnId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Team_espnId_key" ON "Team"("espnId");
