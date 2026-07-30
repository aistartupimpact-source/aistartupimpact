/**
 * Test factories — create mock data for tests.
 * Composable: pass overrides to customize.
 */

export function createMockTool(overrides: Record<string, any> = {}) {
  return {
    id: 'tool-test-001',
    name: 'Test AI Tool',
    slug: 'test-ai-tool',
    tagline: 'A test AI tool for unit testing',
    description: 'Full description of the test AI tool used in testing.',
    websiteUrl: 'https://test-tool.example.com',
    logoUrl: null,
    categoryId: 'cat-001',
    pricingModel: 'FREEMIUM',
    status: 'APPROVED',
    upvoteCount: 10,
    avgRating: 4.5,
    reviewCount: 3,
    isFeatured: false,
    deletedAt: null,
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
    ...overrides,
  };
}

export function createMockStartup(overrides: Record<string, any> = {}) {
  return {
    id: 'startup-test-001',
    name: 'Test AI Startup',
    slug: 'test-ai-startup',
    tagline: 'Building the future of AI testing',
    description: 'A startup focused on AI testing solutions.',
    websiteUrl: 'https://test-startup.example.com',
    headquartersCity: 'Hyderabad',
    stage: 'SEED',
    status: 'ACTIVE',
    isApproved: true,
    isVerified: false,
    deletedAt: null,
    createdAt: '2025-01-10T08:00:00Z',
    ...overrides,
  };
}

export function createMockUser(overrides: Record<string, any> = {}) {
  return {
    id: 'user-test-001',
    email: 'testuser@example.com',
    name: 'Test User',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z', // 24h+ old by default
    ...overrides,
  };
}

export function createMockFounder(overrides: Record<string, any> = {}) {
  return {
    userId: 'founder-test-001',
    email: 'founder@example.com',
    name: 'Test Founder',
    onboardingCompleted: true,
    ...overrides,
  };
}

export function createMockEvent(overrides: Record<string, any> = {}) {
  return {
    id: 'event-test-001',
    title: 'AI Hackathon 2026',
    slug: 'ai-hackathon-2026',
    description: 'A hackathon for AI builders',
    startDate: '2026-08-15T09:00:00Z',
    endDate: '2026-08-16T18:00:00Z',
    location: 'Hyderabad',
    format: 'offline',
    maxAttendees: 200,
    ...overrides,
  };
}
