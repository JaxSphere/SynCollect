ALTER TABLE "accounts"
  ADD COLUMN "year_account" integer,
  ADD COLUMN "guarantor_name" text,
  ADD COLUMN "relationship" text,
  ADD COLUMN "guarantor_contacts" text,
  ADD COLUMN "guarantor_address" text,
  ADD COLUMN "due_date" date,
  ADD COLUMN "bill" decimal(12, 2),
  ADD COLUMN "remarks" text;
