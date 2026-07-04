-- CreateTable
CREATE TABLE "ApplicationAIInsight" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" JSONB NOT NULL,
    "semiFlags" JSONB NOT NULL,
    "redFlags" JSONB NOT NULL,
    "recommendedQuestions" JSONB NOT NULL,
    "suitabilityScore" INTEGER NOT NULL,
    "rawResponse" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationAIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationAIInsight_applicationId_key" ON "ApplicationAIInsight"("applicationId");

-- AddForeignKey
ALTER TABLE "ApplicationAIInsight" ADD CONSTRAINT "ApplicationAIInsight_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "AdoptionApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
