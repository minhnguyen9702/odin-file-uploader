/*
  Warnings:

  - A unique constraint covering the columns `[uniqueFileName]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uniqueFileName` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "uniqueFileName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "File_uniqueFileName_key" ON "File"("uniqueFileName");
