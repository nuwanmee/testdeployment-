/*
  Warnings:

  - You are about to drop the column `ageRangeMax` on the `preference` table. All the data in the column will be lost.
  - You are about to drop the column `ageRangeMin` on the `preference` table. All the data in the column will be lost.
  - You are about to drop the column `heightRangeMax` on the `preference` table. All the data in the column will be lost.
  - You are about to drop the column `heightRangeMin` on the `preference` table. All the data in the column will be lost.
  - You are about to drop the column `otherPreferences` on the `preference` table. All the data in the column will be lost.
  - You are about to drop the column `preferredCaste` on the `preference` table. All the data in the column will be lost.
  - You are about to drop the column `preferredEducation` on the `preference` table. All the data in the column will be lost.
  - You are about to drop the column `preferredLocation` on the `preference` table. All the data in the column will be lost.
  - You are about to drop the column `preferredReligion` on the `preference` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `preference` DROP COLUMN `ageRangeMax`,
    DROP COLUMN `ageRangeMin`,
    DROP COLUMN `heightRangeMax`,
    DROP COLUMN `heightRangeMin`,
    DROP COLUMN `otherPreferences`,
    DROP COLUMN `preferredCaste`,
    DROP COLUMN `preferredEducation`,
    DROP COLUMN `preferredLocation`,
    DROP COLUMN `preferredReligion`,
    ADD COLUMN `ageEnabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `ageMax` INTEGER NOT NULL DEFAULT 50,
    ADD COLUMN `ageMin` INTEGER NOT NULL DEFAULT 18,
    ADD COLUMN `ageWeight` INTEGER NOT NULL DEFAULT 50,
    ADD COLUMN `caste` VARCHAR(191) NULL,
    ADD COLUMN `casteEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `casteWeight` INTEGER NOT NULL DEFAULT 50,
    ADD COLUMN `education` VARCHAR(191) NULL,
    ADD COLUMN `educationEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `educationWeight` INTEGER NOT NULL DEFAULT 50,
    ADD COLUMN `heightEnabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `heightMax` DOUBLE NOT NULL DEFAULT 190,
    ADD COLUMN `heightMin` DOUBLE NOT NULL DEFAULT 150,
    ADD COLUMN `heightWeight` INTEGER NOT NULL DEFAULT 50,
    ADD COLUMN `locations` TEXT NULL,
    ADD COLUMN `locationsEnabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `locationsWeight` INTEGER NOT NULL DEFAULT 50,
    ADD COLUMN `religion` VARCHAR(191) NULL,
    ADD COLUMN `religionEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `religionWeight` INTEGER NOT NULL DEFAULT 50;
