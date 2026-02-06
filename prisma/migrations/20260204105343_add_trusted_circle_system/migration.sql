-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lifeStatus" TEXT NOT NULL DEFAULT 'alive',
ADD COLUMN     "lifeStatusUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "lifeStatusVerifiedBy" TEXT;

-- CreateTable
CREATE TABLE "trusted_circle_invites" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "inviteeEmail" TEXT NOT NULL,
    "inviteeName" TEXT NOT NULL,
    "relationshipToSender" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "proposedAccessLevel" TEXT NOT NULL DEFAULT 'viewer',
    "proposedPermissions" JSONB,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trusted_circle_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trusted_connections" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "relationshipAToB" TEXT NOT NULL,
    "relationshipBToA" TEXT NOT NULL,
    "accessAToB" JSONB NOT NULL,
    "accessBToA" JSONB NOT NULL,
    "connectionOrigin" TEXT NOT NULL DEFAULT 'invite',
    "originInviteId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trusted_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trusted_circle_invites_token_key" ON "trusted_circle_invites"("token");

-- CreateIndex
CREATE INDEX "trusted_circle_invites_inviteeEmail_idx" ON "trusted_circle_invites"("inviteeEmail");

-- CreateIndex
CREATE INDEX "trusted_circle_invites_token_idx" ON "trusted_circle_invites"("token");

-- CreateIndex
CREATE INDEX "trusted_circle_invites_status_idx" ON "trusted_circle_invites"("status");

-- CreateIndex
CREATE UNIQUE INDEX "trusted_circle_invites_senderId_inviteeEmail_key" ON "trusted_circle_invites"("senderId", "inviteeEmail");

-- CreateIndex
CREATE INDEX "trusted_connections_userAId_idx" ON "trusted_connections"("userAId");

-- CreateIndex
CREATE INDEX "trusted_connections_userBId_idx" ON "trusted_connections"("userBId");

-- CreateIndex
CREATE UNIQUE INDEX "trusted_connections_userAId_userBId_key" ON "trusted_connections"("userAId", "userBId");

-- AddForeignKey
ALTER TABLE "trusted_circle_invites" ADD CONSTRAINT "trusted_circle_invites_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trusted_connections" ADD CONSTRAINT "trusted_connections_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trusted_connections" ADD CONSTRAINT "trusted_connections_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
