import type { Request } from 'express';
import type { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub:   string;
  email: string;
  role:  UserRole;
  iat?:  number;
  exp?:  number;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data:    T;
  message?: string;
}

export interface ApiError {
  success: false;
  error:   string;
  details?: unknown;
}

export interface PaginationMeta {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  success:    true;
  data:       T[];
  pagination: PaginationMeta;
}

export type { UserRole };
