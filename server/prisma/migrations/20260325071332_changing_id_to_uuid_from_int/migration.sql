/*
  Warnings:

  - The primary key for the `Company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Document` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EnquiryRole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EntityType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Individual` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `InterestType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Koperasi` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LandTitleType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LeaseholdDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Media` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `NotificationPreference` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Property` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PropertyCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PropertyEnquiry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PropertyOwnershipType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ShortlistFolder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ShortlistProperty` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserEntityType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Utilization` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_userId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "EnquiryRole" DROP CONSTRAINT "EnquiryRole_enquiryId_fkey";

-- DropForeignKey
ALTER TABLE "EnquiryRole" DROP CONSTRAINT "EnquiryRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Individual" DROP CONSTRAINT "Individual_userId_fkey";

-- DropForeignKey
ALTER TABLE "Koperasi" DROP CONSTRAINT "Koperasi_userId_fkey";

-- DropForeignKey
ALTER TABLE "LeaseholdDetail" DROP CONSTRAINT "LeaseholdDetail_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_enquiryId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationPreference" DROP CONSTRAINT "NotificationPreference_userId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_landMediaId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_ownershipTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_titleTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_userId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_utilizationId_fkey";

-- DropForeignKey
ALTER TABLE "PropertyEnquiry" DROP CONSTRAINT "PropertyEnquiry_interestTypeId_fkey";

-- DropForeignKey
ALTER TABLE "PropertyEnquiry" DROP CONSTRAINT "PropertyEnquiry_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "PropertyEnquiry" DROP CONSTRAINT "PropertyEnquiry_userId_fkey";

-- DropForeignKey
ALTER TABLE "ShortlistFolder" DROP CONSTRAINT "ShortlistFolder_userId_fkey";

-- DropForeignKey
ALTER TABLE "ShortlistProperty" DROP CONSTRAINT "ShortlistProperty_folderId_fkey";

-- DropForeignKey
ALTER TABLE "ShortlistProperty" DROP CONSTRAINT "ShortlistProperty_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_profileMediaId_fkey";

-- DropForeignKey
ALTER TABLE "UserEntityType" DROP CONSTRAINT "UserEntityType_entityTypeId_fkey";

-- DropForeignKey
ALTER TABLE "UserEntityType" DROP CONSTRAINT "UserEntityType_userId_fkey";

-- AlterTable
ALTER TABLE "Company" DROP CONSTRAINT "Company_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Company_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Company_id_seq";

-- AlterTable
ALTER TABLE "Document" DROP CONSTRAINT "Document_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "mediaId" SET DATA TYPE TEXT,
ALTER COLUMN "verifiedBy" SET DATA TYPE TEXT,
ADD CONSTRAINT "Document_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Document_id_seq";

-- AlterTable
ALTER TABLE "EnquiryRole" DROP CONSTRAINT "EnquiryRole_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "enquiryId" SET DATA TYPE TEXT,
ALTER COLUMN "roleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "EnquiryRole_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "EnquiryRole_id_seq";

-- AlterTable
ALTER TABLE "EntityType" DROP CONSTRAINT "EntityType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "EntityType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "EntityType_id_seq";

-- AlterTable
ALTER TABLE "Individual" DROP CONSTRAINT "Individual_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Individual_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Individual_id_seq";

-- AlterTable
ALTER TABLE "InterestType" DROP CONSTRAINT "InterestType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "InterestType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "InterestType_id_seq";

-- AlterTable
ALTER TABLE "Koperasi" DROP CONSTRAINT "Koperasi_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Koperasi_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Koperasi_id_seq";

-- AlterTable
ALTER TABLE "LandTitleType" DROP CONSTRAINT "LandTitleType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "LandTitleType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LandTitleType_id_seq";

-- AlterTable
ALTER TABLE "LeaseholdDetail" DROP CONSTRAINT "LeaseholdDetail_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "propertyId" SET DATA TYPE TEXT,
ADD CONSTRAINT "LeaseholdDetail_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LeaseholdDetail_id_seq";

-- AlterTable
ALTER TABLE "Location" DROP CONSTRAINT "Location_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "propertyId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Location_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Location_id_seq";

-- AlterTable
ALTER TABLE "Media" DROP CONSTRAINT "Media_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Media_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Media_id_seq";

-- AlterTable
ALTER TABLE "Message" DROP CONSTRAINT "Message_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "senderId" SET DATA TYPE TEXT,
ALTER COLUMN "receiverId" SET DATA TYPE TEXT,
ALTER COLUMN "enquiryId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Message_id_seq";

-- AlterTable
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Notification_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Notification_id_seq";

-- AlterTable
ALTER TABLE "NotificationPreference" DROP CONSTRAINT "NotificationPreference_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "NotificationPreference_id_seq";

-- AlterTable
ALTER TABLE "Property" DROP CONSTRAINT "Property_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "categoryId" SET DATA TYPE TEXT,
ALTER COLUMN "ownershipTypeId" SET DATA TYPE TEXT,
ALTER COLUMN "utilizationId" SET DATA TYPE TEXT,
ALTER COLUMN "titleTypeId" SET DATA TYPE TEXT,
ALTER COLUMN "landMediaId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Property_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Property_id_seq";

-- AlterTable
ALTER TABLE "PropertyCategory" DROP CONSTRAINT "PropertyCategory_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PropertyCategory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PropertyCategory_id_seq";

-- AlterTable
ALTER TABLE "PropertyEnquiry" DROP CONSTRAINT "PropertyEnquiry_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "propertyId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "interestTypeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PropertyEnquiry_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PropertyEnquiry_id_seq";

-- AlterTable
ALTER TABLE "PropertyOwnershipType" DROP CONSTRAINT "PropertyOwnershipType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PropertyOwnershipType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PropertyOwnershipType_id_seq";

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Role_id_seq";

-- AlterTable
ALTER TABLE "ShortlistFolder" DROP CONSTRAINT "ShortlistFolder_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ShortlistFolder_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ShortlistFolder_id_seq";

-- AlterTable
ALTER TABLE "ShortlistProperty" DROP CONSTRAINT "ShortlistProperty_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "folderId" SET DATA TYPE TEXT,
ALTER COLUMN "propertyId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ShortlistProperty_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ShortlistProperty_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "profileMediaId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "UserEntityType" DROP CONSTRAINT "UserEntityType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "entityTypeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserEntityType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserEntityType_id_seq";

-- AlterTable
ALTER TABLE "Utilization" DROP CONSTRAINT "Utilization_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Utilization_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Utilization_id_seq";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profileMediaId_fkey" FOREIGN KEY ("profileMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Individual" ADD CONSTRAINT "Individual_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Koperasi" ADD CONSTRAINT "Koperasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEntityType" ADD CONSTRAINT "UserEntityType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEntityType" ADD CONSTRAINT "UserEntityType_entityTypeId_fkey" FOREIGN KEY ("entityTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_landMediaId_fkey" FOREIGN KEY ("landMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PropertyCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownershipTypeId_fkey" FOREIGN KEY ("ownershipTypeId") REFERENCES "PropertyOwnershipType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_utilizationId_fkey" FOREIGN KEY ("utilizationId") REFERENCES "Utilization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_titleTypeId_fkey" FOREIGN KEY ("titleTypeId") REFERENCES "LandTitleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaseholdDetail" ADD CONSTRAINT "LeaseholdDetail_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyEnquiry" ADD CONSTRAINT "PropertyEnquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyEnquiry" ADD CONSTRAINT "PropertyEnquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyEnquiry" ADD CONSTRAINT "PropertyEnquiry_interestTypeId_fkey" FOREIGN KEY ("interestTypeId") REFERENCES "InterestType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnquiryRole" ADD CONSTRAINT "EnquiryRole_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "PropertyEnquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnquiryRole" ADD CONSTRAINT "EnquiryRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "PropertyEnquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortlistFolder" ADD CONSTRAINT "ShortlistFolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortlistProperty" ADD CONSTRAINT "ShortlistProperty_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "ShortlistFolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortlistProperty" ADD CONSTRAINT "ShortlistProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
