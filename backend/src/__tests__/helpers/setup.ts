import { vi } from 'vitest';

// Mock Prisma — simple mock without vi.fn() to avoid hoisting issues
vi.mock('../../config/database', () => ({
  prisma: {
    blogPost: { findMany() {}, findUnique() {}, findFirst() {}, create() {}, update() {}, delete() {}, count() {} },
    blogCategory: { findMany() {}, findUnique() {}, create() {}, update() {}, delete() {} },
    blogTag: { findMany() {}, findUnique() {}, create() {}, update() {}, delete() {} },
    blogComment: { findMany() {}, findUnique() {}, create() {}, update() {}, delete() {}, count() {} },
    blogMedia: { findMany() {}, findUnique() {}, create() {}, delete() {} },
    $connect() {},
    $disconnect() {},
    $use() {},
    $transaction(fn: (p: any) => any) { return fn({}); },
  },
  connectDB: () => Promise.resolve(),
  disconnectDB: () => Promise.resolve(),
}));
