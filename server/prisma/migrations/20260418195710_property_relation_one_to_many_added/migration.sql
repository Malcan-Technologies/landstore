/*
  Warnings:

  - The `status` column on the `Property` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('draft', 'active', 'pending', 'under review', 'need more info');

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_landMediaId_fkey";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "propertyId" TEXT;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "status",
ADD COLUMN     "status" "PropertyStatus";

-- CreateIndex
CREATE INDEX "Media_propertyId_idx" ON "Media"("propertyId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
