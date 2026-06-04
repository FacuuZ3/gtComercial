-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('FREE', 'BASIC', 'PRO');

-- DropIndex
DROP INDEX "audit_logs_actorId_createdAt_idx";

-- DropIndex
DROP INDEX "audit_logs_createdAt_idx";

-- DropIndex
DROP INDEX "audit_logs_resource_resourceId_idx";

-- DropIndex
DROP INDEX "courts_isActive_idx";

-- DropIndex
DROP INDEX "recurring_reservations_courtId_dayOfWeek_isActive_idx";

-- DropIndex
DROP INDEX "reservations_courtId_startTime_endTime_idx";

-- DropIndex
DROP INDEX "reservations_status_idx";

-- DropIndex
DROP INDEX "reservations_userId_startTime_idx";

-- DropIndex
DROP INDEX "users_email_key";

-- DropIndex
DROP INDEX "users_role_idx";

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "tenantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "club_info" DROP CONSTRAINT "club_info_pkey",
ADD COLUMN     "tenantId" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "club_info_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "courts" ADD COLUMN     "tenantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "recurring_reservations" ADD COLUMN     "tenantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "tenantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "tenantId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(60) NOT NULL,
    "plan" "TenantPlan" NOT NULL DEFAULT 'FREE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_actorId_createdAt_idx" ON "audit_logs"("tenantId", "actorId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_resource_resourceId_idx" ON "audit_logs"("tenantId", "resource", "resourceId");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_createdAt_idx" ON "audit_logs"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "club_info_tenantId_key" ON "club_info"("tenantId");

-- CreateIndex
CREATE INDEX "courts_tenantId_isActive_idx" ON "courts"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "recurring_reservations_tenantId_courtId_dayOfWeek_isActive_idx" ON "recurring_reservations"("tenantId", "courtId", "dayOfWeek", "isActive");

-- CreateIndex
CREATE INDEX "reservations_tenantId_courtId_startTime_endTime_idx" ON "reservations"("tenantId", "courtId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "reservations_tenantId_userId_startTime_idx" ON "reservations"("tenantId", "userId", "startTime");

-- CreateIndex
CREATE INDEX "reservations_tenantId_status_idx" ON "reservations"("tenantId", "status");

-- CreateIndex
CREATE INDEX "users_tenantId_role_idx" ON "users"("tenantId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courts" ADD CONSTRAINT "courts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_reservations" ADD CONSTRAINT "recurring_reservations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_info" ADD CONSTRAINT "club_info_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

