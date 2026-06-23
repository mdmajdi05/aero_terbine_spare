import type { PrismaClient } from '@prisma/client';

export abstract class BaseRepository {
  protected readonly db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }
}
