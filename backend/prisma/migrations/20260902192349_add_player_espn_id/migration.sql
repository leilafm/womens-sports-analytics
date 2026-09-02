/*
  Warnings:

  - A unique constraint covering the columns `[espnId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `espnId` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "espnId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Player_espnId_key" ON "Player"("espnId");
