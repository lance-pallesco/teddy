-- CreateEnum
CREATE TYPE "ChatMode" AS ENUM ('MANUAL', 'AI_ASSISTED');

-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('ACTIVE', 'AWAITING', 'COMPLETED');

-- AlterEnum
ALTER TYPE "AdoptionStatus" ADD VALUE 'INTERVIEW_IN_PROGRESS';

-- AlterTable
ALTER TABLE "AdoptionApplication" ADD COLUMN     "aiPostInterviewSummary" JSONB,
ADD COLUMN     "chatMode" "ChatMode",
ADD COLUMN     "chatQuestionIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "chatQuestions" JSONB,
ADD COLUMN     "chatStatus" "ChatStatus";

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "senderId" TEXT,
    "senderName" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatMessage_applicationId_idx" ON "ChatMessage"("applicationId");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "AdoptionApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
