-- AlterTable
ALTER TABLE `profile` ADD COLUMN `rejectedBy` VARCHAR(191) NULL,
    ADD COLUMN `rejectionReason` VARCHAR(191) NULL;
