-- CreateTable
CREATE TABLE "trustees" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "relationship" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trustees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legacy_access_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "requesterPhone" TEXT,
    "relationship" TEXT NOT NULL,
    "verificationMethod" TEXT NOT NULL,
    "deathCertificateUrl" TEXT,
    "deathCertificateUploadedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "statusMessage" TEXT,
    "gracePeriodStart" TIMESTAMP(3),
    "gracePeriodEnd" TIMESTAMP(3),
    "graceNotificationsSent" INTEGER NOT NULL DEFAULT 0,
    "accessGrantedAt" TIMESTAMP(3),
    "accessExpiresAt" TIMESTAMP(3),
    "accessToken" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legacy_access_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trustee_confirmations" (
    "id" TEXT NOT NULL,
    "legacyRequestId" TEXT NOT NULL,
    "trusteeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confirmedAt" TIMESTAMP(3),
    "confirmationToken" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trustee_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trustees_verificationToken_key" ON "trustees"("verificationToken");

-- CreateIndex
CREATE INDEX "trustees_userId_idx" ON "trustees"("userId");

-- CreateIndex
CREATE INDEX "trustees_email_idx" ON "trustees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "trustees_userId_email_key" ON "trustees"("userId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "legacy_access_requests_accessToken_key" ON "legacy_access_requests"("accessToken");

-- CreateIndex
CREATE INDEX "legacy_access_requests_userId_idx" ON "legacy_access_requests"("userId");

-- CreateIndex
CREATE INDEX "legacy_access_requests_requesterEmail_idx" ON "legacy_access_requests"("requesterEmail");

-- CreateIndex
CREATE INDEX "legacy_access_requests_status_idx" ON "legacy_access_requests"("status");

-- CreateIndex
CREATE INDEX "legacy_access_requests_accessToken_idx" ON "legacy_access_requests"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "trustee_confirmations_confirmationToken_key" ON "trustee_confirmations"("confirmationToken");

-- CreateIndex
CREATE INDEX "trustee_confirmations_legacyRequestId_idx" ON "trustee_confirmations"("legacyRequestId");

-- CreateIndex
CREATE INDEX "trustee_confirmations_trusteeId_idx" ON "trustee_confirmations"("trusteeId");

-- CreateIndex
CREATE UNIQUE INDEX "trustee_confirmations_legacyRequestId_trusteeId_key" ON "trustee_confirmations"("legacyRequestId", "trusteeId");

-- AddForeignKey
ALTER TABLE "trustees" ADD CONSTRAINT "trustees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_access_requests" ADD CONSTRAINT "legacy_access_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trustee_confirmations" ADD CONSTRAINT "trustee_confirmations_legacyRequestId_fkey" FOREIGN KEY ("legacyRequestId") REFERENCES "legacy_access_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trustee_confirmations" ADD CONSTRAINT "trustee_confirmations_trusteeId_fkey" FOREIGN KEY ("trusteeId") REFERENCES "trustees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
