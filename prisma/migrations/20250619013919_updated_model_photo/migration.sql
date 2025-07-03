/*
  Warnings:

  - Added the required column `fileSize` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `photo` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `fileSize` INTEGER NOT NULL,
    ADD COLUMN `isApproved` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `mimeType` VARCHAR(191) NOT NULL,
    ADD COLUMN `originalName` VARCHAR(191) NOT NULL;
