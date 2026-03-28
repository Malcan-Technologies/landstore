-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash";

ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';

ALTER TABLE "User" ADD COLUMN "name" TEXT;

ALTER TABLE "User" ADD COLUMN "image" TEXT;

ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- Set default for userType if not already set
UPDATE "User" SET "userType" = 'user' WHERE "userType" IS NULL;
