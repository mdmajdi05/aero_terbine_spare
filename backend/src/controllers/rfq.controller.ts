import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import * as rfqService from '../services/rfq.service';
import type { RFQStatus } from '@prisma/client';

export async function submitRFQ(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user?.sub;
    const result = await rfqService.submitRFQ({ ...req.body, userId });
    res.status(201).json(result);
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function getMyRFQs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const result = await rfqService.listUserRFQs(req.user.sub, req.query as Record<string, unknown>);
    res.json(result);
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function getRFQ(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const result = await rfqService.getRFQ(req.params.id);
    res.json(result);
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function listAllRFQs(req: Request, res: Response): Promise<void> {
  try {
    const result = await rfqService.listAllRFQs(req.query as Record<string, unknown>);
    res.json(result);
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function updateRFQStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status, quoteAmount, estimatedDelivery } = req.body as {
      status: RFQStatus;
      quoteAmount?: number;
      estimatedDelivery?: string;
    };
    const result = await rfqService.updateRFQStatus(req.params.id, status, {
      quoteAmount,
      quotedById: req.user.sub,
      estimatedDelivery,
    });
    res.json(result);
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}
