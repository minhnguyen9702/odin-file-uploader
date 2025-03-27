/*
  Warnings:

  - You are about to drop the column `uniqueFileName` on the `File` table. All the data in the column will be lost.
  - Added the required column `fileUrl` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "File_uniqueFileName_key";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "uniqueFileName",
ADD COLUMN     "fileUrl" TEXT NOT NULL;
