/*
  Warnings:

  - A unique constraint covering the columns `[creditor_reference]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "accounts_creditor_reference_key" ON "accounts"("creditor_reference");
