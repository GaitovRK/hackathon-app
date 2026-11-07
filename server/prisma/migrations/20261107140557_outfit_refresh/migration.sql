-- CreateTable
CREATE TABLE "OutfitRefresh" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "occasion" "Occasion" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutfitRefresh_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutfitRefresh_userId_date_idx" ON "OutfitRefresh"("userId", "date");

-- AddForeignKey
ALTER TABLE "OutfitRefresh" ADD CONSTRAINT "OutfitRefresh_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
