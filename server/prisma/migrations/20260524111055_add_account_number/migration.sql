/*
  Warnings:

  - A unique constraint covering the columns `[account_number]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- Create a sequence for account numbers
CREATE SEQUENCE IF NOT EXISTS "accounts_account_number_seq";

-- Add the new column as nullable so we can populate it safely
ALTER TABLE "accounts" ADD COLUMN "account_number" integer;

-- Populate existing rows with sequential values from the sequence
UPDATE "accounts" SET "account_number" = nextval('"accounts_account_number_seq"');

-- Ensure the sequence's last value is at least the max(account_number)
SELECT setval('"accounts_account_number_seq"', COALESCE((SELECT MAX("account_number") FROM "accounts"), 1), true);

-- Make the column non-nullable and set the default to the sequence
ALTER TABLE "accounts" ALTER COLUMN "account_number" SET DEFAULT nextval('"accounts_account_number_seq"');
ALTER TABLE "accounts" ALTER COLUMN "account_number" SET NOT NULL;
ALTER SEQUENCE "accounts_account_number_seq" OWNED BY "accounts"."account_number";

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_account_number_key" ON "accounts"("account_number");
