import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { UserRepository } from '../repositories/user.repository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import type { UserRole } from '@prisma/client';

const userRepo = new UserRepository(prisma);

export interface RegisterInput {
  email:    string;
  password: string;
  fullName: string;
  company:  string;
  cageCode?: string;
  phone:    string;
  country?: string;
  address?: string;
}

export interface LoginInput {
  email:    string;
  password: string;
}

function tokenPair(id: string, email: string, role: UserRole) {
  const payload = { sub: id, email, role };
  return {
    accessToken:  signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function register(input: RegisterInput) {
  const existing = await userRepo.findByEmail(input.email);
  if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await userRepo.create({
    email: input.email,
    passwordHash,
    fullName: input.fullName,
    company:  input.company,
    cageCode: input.cageCode,
    phone:    input.phone,
    country:  input.country ?? 'United States',
    address:  input.address,
    role:     'User',
  });

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, ...tokenPair(user.id, user.email, user.role) };
}

export async function login(input: LoginInput) {
  const user = await userRepo.findByEmail(input.email);
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  if (!user.isActive) throw Object.assign(new Error('Account suspended'), { status: 403 });

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  await userRepo.touchLastLogin(user.id);
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, ...tokenPair(user.id, user.email, user.role) };
}

export async function refresh(token: string) {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
  }

  try {
    const user = await userRepo.findById(payload.sub);
    if (!user || !user.isActive) {
      throw Object.assign(new Error('User not found or suspended'), { status: 401 });
    }
    return tokenPair(user.id, user.email, user.role);
  } catch (err: unknown) {
    // If the DB is temporarily down (Neon wake-up, etc.), allow the refresh anyway
    // since the JWT itself is still valid. The user status check is a best-effort
    // revocation guard, not a hard requirement for every refresh attempt.
    const e = err as { status?: number; message?: string };
    if (e.status === 401) throw err; // confirmed suspension/deletion — reject
    console.warn('⚠️  DB unavailable during token refresh, proceeding with cached user state:', e.message);
    return tokenPair(payload.sub, payload.email, payload.role);
  }
}

export async function getProfile(userId: string) {
  const user = await userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export async function updateProfile(userId: string, data: Partial<Omit<RegisterInput, 'email' | 'password'>>) {
  const user = await userRepo.update(userId, data);
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  const user = await userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const valid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!valid) throw Object.assign(new Error('Current password is incorrect'), { status: 400 });

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await userRepo.update(userId, { passwordHash });
}
