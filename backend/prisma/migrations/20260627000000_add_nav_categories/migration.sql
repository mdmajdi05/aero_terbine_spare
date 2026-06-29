-- AlterTable: add columns to excel_feeds
ALTER TABLE "excel_feeds" ADD COLUMN IF NOT EXISTS "type" TEXT;
ALTER TABLE "excel_feeds" ADD COLUMN IF NOT EXISTS "category_slug" TEXT;
ALTER TABLE "excel_feeds" ADD COLUMN IF NOT EXISTS "category_name" TEXT;
ALTER TABLE "excel_feeds" ADD COLUMN IF NOT EXISTS "industry_slug" TEXT;
ALTER TABLE "excel_feeds" ADD COLUMN IF NOT EXISTS "columns" JSONB NOT NULL DEFAULT '[]';

-- CreateTable: nav_categories
CREATE TABLE IF NOT EXISTS "nav_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parent_id" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "manufacturer" TEXT,
    "part_count" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nav_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "nav_categories_slug_key" ON "nav_categories"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "nav_categories_type_idx" ON "nav_categories"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "nav_categories_parent_id_idx" ON "nav_categories"("parent_id");
