import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, unlink } from 'fs/promises';
import path from 'path';

const BRAND_DIR = path.join(process.cwd(), 'public', 'assets', 'branding');

async function clearLogoFiles() {
  try {
    const files = await readdir(BRAND_DIR);
    await Promise.all(
      files
        .filter((f) => f.startsWith('logo.'))
        .map((f) => unlink(path.join(BRAND_DIR, f)).catch(() => undefined))
    );
  } catch { /* dir may not exist yet */ }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('logo') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const ext     = file.name.split('.').pop()?.toLowerCase() || 'png';
    const allowed = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
    if (!allowed.includes(ext))
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });

    const bytes    = await file.arrayBuffer();
    const buffer   = Buffer.from(bytes);
    const filename = `logo.${ext}`;

    await mkdir(BRAND_DIR, { recursive: true });
    // Delete any old logo files before saving the new one
    await clearLogoFiles();
    await writeFile(path.join(BRAND_DIR, filename), buffer);

    return NextResponse.json({ success: true, path: `/assets/branding/${filename}` });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// Called when admin removes the logo — deletes the physical file from disk
export async function DELETE() {
  try {
    await clearLogoFiles();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
