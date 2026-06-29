import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';

const FEED_PATH = path.join(process.cwd(), 'public', 'data', 'excel-feed.json');

const EMPTY = {
  source: 'local',
  feeds: [],
  categories: [],
};

async function ensureDir() {
  await mkdir(path.dirname(FEED_PATH), { recursive: true });
}

export async function GET() {
  try {
    const raw = await readFile(FEED_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json(EMPTY);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    await ensureDir();
    await writeFile(FEED_PATH, JSON.stringify({ ...body, source: 'local' }, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { feedId } = body as { feedId?: string };
    if (feedId) {
      const raw = await readFile(FEED_PATH, 'utf-8').catch(() => '{}');
      const data = JSON.parse(raw);
      const feeds = (data.feeds ?? []).filter((f: { id?: string }) => f.id !== feedId);
      await writeFile(FEED_PATH, JSON.stringify({ ...data, feeds }, null, 2));
    } else {
      await ensureDir();
      await writeFile(FEED_PATH, JSON.stringify(EMPTY, null, 2));
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
