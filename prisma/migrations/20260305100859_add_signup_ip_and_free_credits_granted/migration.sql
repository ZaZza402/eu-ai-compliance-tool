-- AlterTable
ALTER TABLE "users" ADD COLUMN     "freeCreditsGranted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "signupIp" TEXT,
ALTER COLUMN "credits" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "users_signupIp_idx" ON "users"("signupIp");
