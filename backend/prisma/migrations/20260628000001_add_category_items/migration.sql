-- AlterTable: add config columns to nav_categories
ALTER TABLE "nav_categories" ADD COLUMN IF NOT EXISTS "card_config" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "nav_categories" ADD COLUMN IF NOT EXISTS "page_config" JSONB NOT NULL DEFAULT '{}';

-- CreateTable: category_items
CREATE TABLE IF NOT EXISTS "category_items" (
    "id" TEXT NOT NULL,
    "nav_category_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "link" TEXT,
    "data" JSONB NOT NULL DEFAULT '{}',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "card_config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "category_items_slug_key" ON "category_items"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "category_items_nav_category_id_idx" ON "category_items"("nav_category_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "category_items_slug_idx" ON "category_items"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "category_items_is_active_idx" ON "category_items"("is_active");

-- AddForeignKey
ALTER TABLE "category_items" ADD CONSTRAINT "category_items_nav_category_id_fkey"
    FOREIGN KEY ("nav_category_id") REFERENCES "nav_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
