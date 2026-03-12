-- CreateTable
CREATE TABLE "FileTest" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileTest_pkey" PRIMARY KEY ("id")
);
