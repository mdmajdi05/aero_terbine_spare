import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const SEED_DATA_PATH = path.join(__dirname, '..', '..', '..', 'src', 'data', 'categories.json');
const SEED_INDUSTRIES_PATH = path.join(__dirname, '..', '..', '..', 'src', 'data', 'industries.json');
const PUBLIC_JSON_PATH = path.join(__dirname, '..', '..', '..', 'public', 'data', 'categories.json');

interface SeedEntry {
  name: string; slug: string; type: string;
  description?: string | null; icon?: string | null; manufacturer?: string | null;
  parentId?: string | null; sortOrder?: number; partCount?: number;
  fsgCode?: string | null; fscCode?: string | null;
  longDescription?: string | null; keyParts?: string[]; clients?: string[]; industryIds?: string[];
  cardConfig?: Record<string, unknown>; pageConfig?: Record<string, unknown>;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Reading seed files...');

  let seed: Record<string, unknown[]> = {};
  if (fs.existsSync(SEED_DATA_PATH)) {
    seed = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf-8'));
  }

  let industriesSeed: Record<string, unknown>[] = [];
  if (fs.existsSync(SEED_INDUSTRIES_PATH)) {
    industriesSeed = JSON.parse(fs.readFileSync(SEED_INDUSTRIES_PATH, 'utf-8')) as Record<string, unknown>[];
  }

  const entries: SeedEntry[] = [];
  let sortIdx = 0;

  // fsgCategories
  for (const c of (seed.fsgCategories ?? [])) {
    const cat = c as Record<string, unknown>;
    const slug = `fsg-${cat.fsg}`;
    entries.push({
      name: cat.name as string, slug, type: 'fsg',
      fsgCode: (cat.fsg as string) ?? null, fscCode: (cat.fsc as string) ?? null,
      description: (cat.description as string) ?? null, icon: (cat.icon as string) ?? null,
      partCount: (cat.partCount as number) ?? 0, sortOrder: sortIdx++,
      cardConfig: { template: "list", showTitle: true, showDescription: true, buttonLabel: "View Details", buttonLink: `/items/${slug}` },
      pageConfig: { template: "list", filters: true, search: true },
    });
  }

  // industries
  for (const ind of (seed.industries ?? [])) {
    const i = ind as Record<string, unknown>;
    const slug = i.slug as string;
    const name = i.name as string;
    const description = (i.description as string) ?? '';
    const enriched = industriesSeed.find(x => (x as Record<string, unknown>).slug === slug) as Record<string, unknown> | undefined;
    entries.push({
      name, slug, type: 'industry',
      description: description || null,
      longDescription: (enriched?.longDescription as string) ?? (i.longDescription as string) ?? null,
      icon: (i.icon as string) ?? null, partCount: (i.partCount as number) ?? 0, sortOrder: sortIdx++,
      keyParts: (enriched?.keyParts as string[]) ?? (i.keyParts as string[]) ?? [],
      clients: (enriched?.clients as string[]) ?? (i.clients as string[]) ?? [],
      cardConfig: { template: "card", showImage: true, placeholder: "", showTitle: true, showDescription: true, showButton: true, buttonLabel: "Explore", buttonLink: `/industries/${slug}`, gridCols: 3 },
      pageConfig: { hero: { title: name, showSubtitle: true, showImage: true }, sections: [], seo: { title: name, description }, filters: true, search: true },
    });
  }

  // productCategories
  for (const c of (seed.productCategories ?? [])) {
    const cat = c as Record<string, unknown>;
    const slug = cat.slug as string;
    entries.push({
      name: cat.name as string, slug, type: 'product',
      description: (cat.description as string) ?? null, icon: (cat.icon as string) ?? null,
      manufacturer: (cat.manufacturer as string) ?? null,
      parentId: (cat.parentId as string) ?? null,
      industryIds: Array.isArray(cat.industryIds) ? cat.industryIds as string[] : [],
      partCount: (cat.partCount as number) ?? 0, sortOrder: sortIdx++,
      cardConfig: { template: "card", showTitle: true, showDescription: true, buttonLabel: "View Details", buttonLink: `/items/${slug}` },
      pageConfig: { template: "card", filters: true, search: true },
    });
  }

  // partCategories
  for (const c of (seed.partCategories ?? [])) {
    const cat = c as Record<string, unknown>;
    const slug = cat.slug as string;
    entries.push({
      name: cat.name as string, slug, type: 'part',
      description: (cat.description as string) ?? null, icon: (cat.icon as string) ?? null,
      manufacturer: (cat.manufacturer as string) ?? null,
      parentId: (cat.parentId as string) ?? null,
      industryIds: Array.isArray(cat.industryIds) ? cat.industryIds as string[] : [],
      partCount: (cat.partCount as number) ?? 0, sortOrder: sortIdx++,
      cardConfig: { template: "list", showTitle: true, showDescription: true, buttonLabel: "View Details", buttonLink: `/items/${slug}` },
      pageConfig: { template: "list", filters: true, search: true },
    });
  }

  console.log(`Clearing existing records...`);
  await prisma.categoryItem.deleteMany();
  await prisma.navCategory.deleteMany();

  console.log(`Seeding ${entries.length} categories...`);
  for (const entry of entries) {
    await prisma.navCategory.create({ data: entry as never });
  }

  // Create sample CategoryItem records for product & part categories
  const itemCategories = await prisma.navCategory.findMany({
    where: { type: { in: ['product', 'part'] } },
  });

  console.log(`Creating sample items for ${itemCategories.length} categories...`);
  for (const category of itemCategories) {
    const itemCount = Math.floor(Math.random() * 3) + 3; // 3-5 items
    for (let n = 1; n <= itemCount; n++) {
      const title = `${category.name} Sample ${n}`;
      await prisma.categoryItem.create({
        data: {
          navCategoryId: category.id,
          title,
          slug: `${category.slug}-sample-${n}`,
          description: `Sample description for ${title}`,
          data: {
            partNumber: `P/N-${n}`,
            price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
            stock: 'In Stock',
          },
          sortOrder: n,
        },
      });
    }
  }

  // Build public JSON with items and config
  const all = await prisma.navCategory.findMany({ orderBy: { sortOrder: 'asc' } }) as Array<Record<string, unknown>>;
  const allItems = await prisma.categoryItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  const itemsByCatId = new Map<string, typeof allItems>();
  for (const item of allItems) {
    const arr = itemsByCatId.get(item.navCategoryId) ?? [];
    arr.push(item);
    itemsByCatId.set(item.navCategoryId, arr);
  }

  const fsgCategories = all.filter(n => n.type === 'fsg').map(n => ({
    id: n.id, name: n.name, fsg: n.fsgCode ?? '', fsc: n.fscCode ?? undefined,
    description: n.description ?? undefined, icon: n.icon ?? undefined, partCount: n.partCount,
    cardConfig: n.cardConfig ?? {}, pageConfig: n.pageConfig ?? {},
  }));

  const industries = all.filter(n => n.type === 'industry').map(n => ({
    id: n.id, name: n.name, slug: n.slug, icon: n.icon ?? undefined,
    description: n.description ?? undefined, longDescription: n.longDescription ?? undefined,
    partCount: n.partCount,
    keyParts: Array.isArray(n.keyParts) && (n.keyParts as unknown[]).length ? n.keyParts : undefined,
    clients: Array.isArray(n.clients) && (n.clients as unknown[]).length ? n.clients : undefined,
    cardConfig: n.cardConfig ?? {}, pageConfig: n.pageConfig ?? {},
  }));

  const productCategories = all.filter(n => n.type === 'product').map(n => ({
    id: n.id, name: n.name, slug: n.slug, type: n.type,
    parentId: n.parentId ?? undefined, industryIds: Array.isArray(n.industryIds) && (n.industryIds as unknown[]).length ? n.industryIds : undefined,
    manufacturer: n.manufacturer ?? undefined, description: n.description ?? undefined,
    icon: n.icon ?? undefined, partCount: n.partCount, sortOrder: n.sortOrder,
    cardConfig: n.cardConfig ?? {}, pageConfig: n.pageConfig ?? {},
    items: (itemsByCatId.get(n.id as string) ?? []).map(i => ({
      id: i.id, title: i.title, slug: i.slug, description: i.description,
      image: i.image, link: i.link, data: i.data, sortOrder: i.sortOrder,
      cardConfig: i.cardConfig,
    })),
  }));

  const partCategories = all.filter(n => n.type === 'part').map(n => ({
    id: n.id, name: n.name, slug: n.slug, type: n.type,
    parentId: n.parentId ?? undefined, industryIds: Array.isArray(n.industryIds) && (n.industryIds as unknown[]).length ? n.industryIds : undefined,
    manufacturer: n.manufacturer ?? undefined, description: n.description ?? undefined,
    icon: n.icon ?? undefined, partCount: n.partCount, sortOrder: n.sortOrder,
    cardConfig: n.cardConfig ?? {}, pageConfig: n.pageConfig ?? {},
    items: (itemsByCatId.get(n.id as string) ?? []).map(i => ({
      id: i.id, title: i.title, slug: i.slug, description: i.description,
      image: i.image, link: i.link, data: i.data, sortOrder: i.sortOrder,
      cardConfig: i.cardConfig,
    })),
  }));

  const tree = { fsgCategories, industries, productCategories, partCategories };

  const dir = path.dirname(PUBLIC_JSON_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PUBLIC_JSON_PATH, JSON.stringify(tree, null, 2), 'utf-8');

  console.log(`Done! Wrote ${entries.length} categories and ${allItems.length} sample items to DB and public/data/categories.json`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
