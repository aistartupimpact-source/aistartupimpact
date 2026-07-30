import { vi } from 'vitest';

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
process.env.FOUNDER_JWT_SECRET = 'test-founder-secret-min-32-characters-long';
process.env.USER_JWT_SECRET = 'test-user-secret-min-32-characters-long-here';
process.env.NEXT_PUBLIC_SITE_URL = 'https://aistartupimpact.com';
process.env.VERCEL_GIT_COMMIT_SHA = 'test123abc';
