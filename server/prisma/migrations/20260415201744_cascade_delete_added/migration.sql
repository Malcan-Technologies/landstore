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
ALTER TABLE "Property" DROP CONSTRAINT "Property_userId_fkey";

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
ALTER TABLE "UserEntityType" DROP CONSTRAINT "UserEntityType_entityTypeId_fkey";

-- DropForeignKey
ALTER TABLE "UserEntityType" DROP CONSTRAINT "UserEntityType_userId_fkey";

-- AddForeignKey
ALTER TABLE "Individual" ADD CONSTRAINT "Individual_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Koperasi" ADD CONSTRAINT "Koperasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEntityType" ADD CONSTRAINT "UserEntityType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEntityType" ADD CONSTRAINT "UserEntityType_entityTypeId_fkey" FOREIGN KEY ("entityTypeId") REFERENCES "EntityType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaseholdDetail" ADD CONSTRAINT "LeaseholdDetail_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyEnquiry" ADD CONSTRAINT "PropertyEnquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyEnquiry" ADD CONSTRAINT "PropertyEnquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnquiryRole" ADD CONSTRAINT "EnquiryRole_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "PropertyEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnquiryRole" ADD CONSTRAINT "EnquiryRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "PropertyEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortlistFolder" ADD CONSTRAINT "ShortlistFolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortlistProperty" ADD CONSTRAINT "ShortlistProperty_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "ShortlistFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortlistProperty" ADD CONSTRAINT "ShortlistProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
