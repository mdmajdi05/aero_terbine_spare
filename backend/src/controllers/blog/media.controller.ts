import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { prisma }          from '../../config/database';
import { getCloudinary }   from '../../config/cloudinary';
import logger              from '../../config/logger';
import { Readable }        from 'stream';
import type { UploadApiResponse } from 'cloudinary';

const CLOUDINARY_FOLDER = 'aeroturbinespare/blog';

// ── Helpers ───────────────────────────────────────────────────

/** Upload a raw buffer to Cloudinary and return the response. */
async function uploadBuffer(buffer: Buffer, options: object): Promise<UploadApiResponse> {
  const cld = await getCloudinary();
  return new Promise((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(options, (err, result) => {
      if (err || !result) return reject(err ?? new Error('Cloudinary upload failed'));
      resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });
}

function buildMeta(total: number, page: number, limit: number) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ── Controllers ───────────────────────────────────────────────

export async function uploadMedia(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const result = await uploadBuffer(req.file.buffer, {
      folder:         CLOUDINARY_FOLDER,
      resource_type:  'image',
      use_filename:   false,
      unique_filename: true,
      overwrite:      false,
      // Auto-optimize: convert to webp for supported browsers, quality auto
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        // Cap very large originals to 2400px wide while preserving aspect ratio
        { width: 2400, crop: 'limit' },
      ],
    });

    const media = await prisma.blogMedia.create({
      data: {
        url:          result.secure_url,
        cloudinaryId: result.public_id,
        filename:     req.file.originalname,
        mimeType:     req.file.mimetype,
        size:         result.bytes,
        width:        result.width  ?? null,
        height:       result.height ?? null,
        alt:          (req.body.alt as string | undefined) ?? '',
        uploadedById: req.user.sub,
      },
    });

    res.status(201).json({ success: true, data: media });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function listMedia(req: AuthenticatedRequest, res: Response) {
  try {
    const page  = Math.max(1,   Number(req.query.page)  || 1);
    const limit = Math.min(100, Number(req.query.limit) || 30);
    const skip  = (page - 1) * limit;

    const [media, total] = await Promise.all([
      prisma.blogMedia.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { uploader: { select: { fullName: true } } },
      }),
      prisma.blogMedia.count(),
    ]);

    res.json({ success: true, data: media, pagination: buildMeta(total, page, limit) });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function deleteMedia(req: AuthenticatedRequest, res: Response) {
  try {
    const media = await prisma.blogMedia.findUnique({ where: { id: req.params.id } });
    if (!media) return res.status(404).json({ success: false, error: 'Not found' });

    // Delete from Cloudinary — non-fatal if it fails (file may already be gone)
    try {
      const cld = await getCloudinary();
      await cld.uploader.destroy(media.cloudinaryId, { resource_type: 'image' });
    } catch (cloudErr: any) {
      logger.warn(`Cloudinary delete warning for ${media.cloudinaryId}: ${cloudErr.message}`);
    }

    await prisma.blogMedia.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Media deleted' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
