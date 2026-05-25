/*
  Warnings:

  - You are about to drop the column `creditor_reference` on the `accounts` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VisitRemarkType" ADD VALUE 'responsed';
ALTER TYPE "VisitRemarkType" ADD VALUE 'transfer_residence';
ALTER TYPE "VisitRemarkType" ADD VALUE 'full_paid';
ALTER TYPE "VisitRemarkType" ADD VALUE 'refuse_to_receive_and_sign';
ALTER TYPE "VisitRemarkType" ADD VALUE 'for_follow_up';
ALTER TYPE "VisitRemarkType" ADD VALUE 'dont_have_capacity_to_pay';
ALTER TYPE "VisitRemarkType" ADD VALUE 'onhold_account';
ALTER TYPE "VisitRemarkType" ADD VALUE 'difficult_to_reach_out';

-- DropIndex
DROP INDEX "accounts_creditor_reference_key";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "creditor_reference",
ALTER COLUMN "account_number" DROP DEFAULT;
DROP SEQUENCE "accounts_account_number_seq";
