-- AlterTable: add new columns to nav_categories
ALTER TABLE "nav_categories" ADD COLUMN IF NOT EXISTS "long_description" TEXT;
ALTER TABLE "nav_categories" ADD COLUMN IF NOT EXISTS "key_parts" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "nav_categories" ADD COLUMN IF NOT EXISTS "clients" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "nav_categories" ADD COLUMN IF NOT EXISTS "fsg_code" TEXT;
ALTER TABLE "nav_categories" ADD COLUMN IF NOT EXISTS "fsc_code" TEXT;
ALTER TABLE "nav_categories" ADD COLUMN IF NOT EXISTS "industry_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];
