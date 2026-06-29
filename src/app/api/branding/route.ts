import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';

const BRAND_PATH = path.join(process.cwd(), 'public', 'data', 'branding.json');

const DEFAULT = { logoImageUrl: null, logoLink: '/', logoText: 'AeroTurbineSpare', logoSubText: 'Aerospace Parts Exchange' };

export async function GET() {
  try {
    const raw = await readFile(BRAND_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json(DEFAULT);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    await mkdir(path.dirname(BRAND_PATH), { recursive: true });
    await writeFile(BRAND_PATH, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
