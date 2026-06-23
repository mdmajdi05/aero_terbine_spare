import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import * as authService from '../services/auth.service';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, ...result });
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const tokens = await authService.refresh(refreshToken);
    res.json({ success: true, ...tokens });
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const profile = await authService.getProfile(req.user.sub);
    res.json({ success: true, data: profile });
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function updateMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const profile = await authService.updateProfile(req.user.sub, req.body);
    res.json({ success: true, data: profile });
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };
    await authService.changePassword(req.user.sub, oldPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}
