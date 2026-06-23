import { prisma } from '../config/database';
import { toCSV, toJSON, createZipArchive } from '../utils/export';

export async function exportUsers(format: 'json' | 'csv'): Promise<{ content: string; filename: string; mime: string }> {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, fullName: true, company: true, role: true, isActive: true, createdAt: true, lastLogin: true },
    orderBy: { createdAt: 'asc' },
  });
  if (format === 'csv') {
    return { content: toCSV(users), filename: 'users.csv', mime: 'text/csv' };
  }
  return { content: toJSON(users), filename: 'users.json', mime: 'application/json' };
}

export async function exportRFQs(format: 'json' | 'csv'): Promise<{ content: string; filename: string; mime: string }> {
  const rfqs = await prisma.rFQ.findMany({ include: { items: true }, orderBy: { createdAt: 'asc' } });
  if (format === 'csv') {
    const flat = rfqs.map((r) => ({ ...r, itemCount: r.items.length, items: undefined }));
    return { content: toCSV(flat), filename: 'rfqs.csv', mime: 'text/csv' };
  }
  return { content: toJSON(rfqs), filename: 'rfqs.json', mime: 'application/json' };
}

export async function exportParts(format: 'json' | 'csv'): Promise<{ content: string; filename: string; mime: string }> {
  const parts = await prisma.part.findMany({ orderBy: { nsn: 'asc' } });
  if (format === 'csv') {
    const flat = parts.map((p) => ({
      ...p,
      specifications:  JSON.stringify(p.specifications),
      crossReferences: p.crossReferences.join(';'),
      tags:            p.tags.join(';'),
    }));
    return { content: toCSV(flat), filename: 'parts.csv', mime: 'text/csv' };
  }
  return { content: toJSON(parts), filename: 'parts.json', mime: 'application/json' };
}

export async function masterExport(triggeredBy: string): Promise<string> {
  const [usersResult, rfqsResult, partsResult, auditLogs] = await Promise.all([
    exportUsers('json'),
    exportRFQs('json'),
    exportParts('json'),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  const zipPath = await createZipArchive(
    [
      { name: 'users.json',      content: usersResult.content },
      { name: 'rfqs.json',       content: rfqsResult.content },
      { name: 'parts.json',      content: partsResult.content },
      { name: 'audit_logs.json', content: toJSON(auditLogs) },
    ],
    `master-export-${Date.now()}.zip`,
  );

  await prisma.backupRecord.create({
    data: {
      triggeredBy,
      type:        'manual',
      status:      'Complete',
      downloadUrl: zipPath,
      completedAt: new Date(),
    },
  });

  return zipPath;
}
