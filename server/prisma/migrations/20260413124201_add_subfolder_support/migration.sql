-- AlterTable
ALTER TABLE "ShortlistFolder" ADD COLUMN     "parentFolderId" TEXT;

-- CreateIndex
CREATE INDEX "ShortlistFolder_userId_idx" ON "ShortlistFolder"("userId");

-- CreateIndex
CREATE INDEX "ShortlistFolder_parentFolderId_idx" ON "ShortlistFolder"("parentFolderId");

-- AddForeignKey
ALTER TABLE "ShortlistFolder" ADD CONSTRAINT "ShortlistFolder_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "ShortlistFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
