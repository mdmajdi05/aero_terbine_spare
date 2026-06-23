import { Parser } from 'json2csv';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

export function toCSV<T extends object>(data: T[], fields?: string[]): string {
  const parser = new Parser({ fields });
  return parser.parse(data);
}

export function toJSON(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export async function createZipArchive(
  files: { name: string; content: string }[],
  outputName: string,
): Promise<string> {
  await fs.promises.mkdir(env.BACKUP_DIR, { recursive: true });
  const outputPath = path.join(env.BACKUP_DIR, outputName);
  const output     = fs.createWriteStream(outputPath);
  const archive    = archiver('zip', { zlib: { level: 9 } });

  await new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);

    for (const file of files) {
      archive.append(file.content, { name: file.name });
    }
    archive.finalize();
  });

  return outputPath;
}
