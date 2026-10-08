/*
  Warnings:

  - A unique constraint covering the columns `[espnId]` on the table `Matchup` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `espnId` to the `Matchup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Matchup" ADD COLUMN     "espnId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "headshot" TEXT,
ADD COLUMN     "jersey" TEXT,
ADD COLUMN     "position" TEXT;

-- CreateTable
CREATE TABLE "FavoritePlayer" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,

    CONSTRAINT "FavoritePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoritePlayer_userId_playerId_key" ON "FavoritePlayer"("userId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Matchup_espnId_key" ON "Matchup"("espnId");

-- AddForeignKey
ALTER TABLE "FavoritePlayer" ADD CONSTRAINT "FavoritePlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritePlayer" ADD CONSTRAINT "FavoritePlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
