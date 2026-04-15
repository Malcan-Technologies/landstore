-- CreateTable
CREATE TABLE "OTPVerification" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpCode" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'password-reset',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OTPVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OTPVerification_email_idx" ON "OTPVerification"("email");

-- CreateIndex
CREATE INDEX "OTPVerification_expiresAt_idx" ON "OTPVerification"("expiresAt");
