-- CreateEnum
CREATE TYPE "DressCode" AS ENUM ('formal', 'smart_casual', 'casual', 'creative');

-- CreateEnum
CREATE TYPE "Wardrobe" AS ENUM ('menswear', 'womenswear', 'both');

-- CreateEnum
CREATE TYPE "SourcePhotoStatus" AS ENUM ('uploaded', 'processing', 'tagged', 'approved', 'failed');

-- CreateEnum
CREATE TYPE "ItemSource" AS ENUM ('starter', 'photo');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory');

-- CreateEnum
CREATE TYPE "Color" AS ENUM ('white', 'black', 'grey', 'navy', 'beige', 'camel', 'brown', 'olive', 'blue', 'light_blue', 'red', 'burgundy', 'pink', 'green', 'yellow', 'orange', 'purple', 'cream');

-- CreateEnum
CREATE TYPE "Pattern" AS ENUM ('solid', 'stripe', 'check', 'print', 'texture');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('spring', 'summer', 'autumn', 'winter');

-- CreateEnum
CREATE TYPE "Occasion" AS ENUM ('work', 'friends', 'date', 'event', 'casual', 'sport', 'travel');

-- CreateEnum
CREATE TYPE "OutfitTemplate" AS ENUM ('separates', 'separates_layered', 'dress', 'dress_layered');

-- CreateEnum
CREATE TYPE "OutfitStatus" AS ENUM ('suggested', 'saved', 'worn');

-- CreateEnum
CREATE TYPE "OutfitSlot" AS ENUM ('top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory');

-- CreateEnum
CREATE TYPE "FeedbackValue" AS ENUM ('like', 'dislike');

-- CreateTable
CREATE TABLE "StyleProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dressCode" "DressCode" NOT NULL DEFAULT 'smart_casual',
    "city" TEXT,
    "wardrobe" "Wardrobe" NOT NULL DEFAULT 'both',
    "onboardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StyleProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StyleSwipe" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "lookId" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StyleSwipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourcePhoto" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "status" "SourcePhotoStatus" NOT NULL DEFAULT 'uploaded',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SourcePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "source" "ItemSource" NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "subcategory" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryColor" "Color" NOT NULL,
    "secondaryColor" "Color",
    "pattern" "Pattern" NOT NULL DEFAULT 'solid',
    "material" TEXT,
    "formality" INTEGER NOT NULL,
    "warmth" INTEGER NOT NULL,
    "seasons" "Season"[],
    "occasions" "Occasion"[],
    "imageUrl" TEXT,
    "starterKey" TEXT,
    "sourcePhotoId" UUID,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outfit" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "occasion" "Occasion" NOT NULL,
    "score" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "template" "OutfitTemplate" NOT NULL,
    "status" "OutfitStatus" NOT NULL DEFAULT 'suggested',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outfit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutfitItem" (
    "id" UUID NOT NULL,
    "outfitId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "slot" "OutfitSlot" NOT NULL,

    CONSTRAINT "OutfitItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutfitFeedback" (
    "id" UUID NOT NULL,
    "outfitId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "value" "FeedbackValue" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutfitFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wear" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "outfitId" UUID NOT NULL,
    "wornOn" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wear_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StyleProfile_userId_key" ON "StyleProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StyleSwipe_profileId_lookId_key" ON "StyleSwipe"("profileId", "lookId");

-- CreateIndex
CREATE INDEX "SourcePhoto_userId_status_idx" ON "SourcePhoto"("userId", "status");

-- CreateIndex
CREATE INDEX "Item_userId_idx" ON "Item"("userId");

-- CreateIndex
CREATE INDEX "Item_userId_category_idx" ON "Item"("userId", "category");

-- CreateIndex
CREATE INDEX "Outfit_userId_date_occasion_idx" ON "Outfit"("userId", "date", "occasion");

-- CreateIndex
CREATE INDEX "Outfit_userId_status_idx" ON "Outfit"("userId", "status");

-- CreateIndex
CREATE INDEX "OutfitItem_itemId_idx" ON "OutfitItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "OutfitItem_outfitId_slot_key" ON "OutfitItem"("outfitId", "slot");

-- CreateIndex
CREATE INDEX "OutfitFeedback_userId_createdAt_idx" ON "OutfitFeedback"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Wear_userId_wornOn_idx" ON "Wear"("userId", "wornOn");

-- CreateIndex
CREATE UNIQUE INDEX "Wear_outfitId_wornOn_key" ON "Wear"("outfitId", "wornOn");

-- AddForeignKey
ALTER TABLE "StyleProfile" ADD CONSTRAINT "StyleProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleSwipe" ADD CONSTRAINT "StyleSwipe_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StyleProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourcePhoto" ADD CONSTRAINT "SourcePhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_sourcePhotoId_fkey" FOREIGN KEY ("sourcePhotoId") REFERENCES "SourcePhoto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outfit" ADD CONSTRAINT "Outfit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem" ADD CONSTRAINT "OutfitItem_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem" ADD CONSTRAINT "OutfitItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitFeedback" ADD CONSTRAINT "OutfitFeedback_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitFeedback" ADD CONSTRAINT "OutfitFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wear" ADD CONSTRAINT "Wear_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wear" ADD CONSTRAINT "Wear_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
