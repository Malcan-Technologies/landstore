/*
  Warnings:

  - The `status` column on the `PropertyEnquiry` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "enquiryStatus" AS ENUM ('SCHEDULED', 'MATCHED_INPROGRESS', 'PENDING_MATCHING', 'UNDER_REVIEW', 'NEED_MORE_INFO', 'CLOSED_NOT_PROCEEDING', 'CLOSED_SUCCESSFUL');

-- AlterEnum
ALTER TYPE "PropertyStatus" ADD VALUE 'deleted';

-- AlterTable
ALTER TABLE "PropertyEnquiry" DROP COLUMN "status",
ADD COLUMN     "status" "enquiryStatus";
