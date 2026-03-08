// Shared type definitions for AIStartupImpact

// ─── User & Auth ─────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  EDITOR_IN_CHIEF = 'EDITOR_IN_CHIEF',
  SENIOR_WRITER = 'SENIOR_WRITER',
  WRITER = 'WRITER',
  AD_MANAGER = 'AD_MANAGER',
  CONTRIBUTOR = 'CONTRIBUTOR',
}

export interface User {
  id: string;
  email: string;
  name: string;
  slug: string;
  role: UserRole;
  bio?: string;
  avatar?: string;
  twitter?: string;
  linkedin?: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Content ─────────────────────────────

export enum ArticleType {
  NEWS = 'NEWS',
  STORY = 'STORY',
  OPINION = 'OPINION',
  TOOL_REVIEW = 'TOOL_REVIEW',
  GUIDE = 'GUIDE',
  COMPARISON = 'COMPARISON',
  REPORT = 'REPORT',
  SPONSORED = 'SPONSORED',
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  REVISION = 'REVISION',
  APPROVED = 'APPROVED',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: Record<string, unknown>;
  contentText?: string;
  type: ArticleType;
  status: ArticleStatus;
  authorId: string;
  author?: User;
  categoryId?: string;
  category?: Category;
  tags?: Tag[];
  readTimeMinutes: number;
  wordCount: number;
  viewCount: number;
  shareCount: number;
  isFeatured: boolean;
  isPinned: boolean;
  isSponsored: boolean;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  sortOrder: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

// ─── AI Tools ────────────────────────────

export enum PricingModel {
  FREE = 'FREE',
  FREEMIUM = 'FREEMIUM',
  PAID = 'PAID',
  ENTERPRISE = 'ENTERPRISE',
  OPEN_SOURCE = 'OPEN_SOURCE',
}

export enum ToolStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  FEATURED = 'FEATURED',
  ARCHIVED = 'ARCHIVED',
}

export interface AiTool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  affiliateUrl?: string;
  logoUrl?: string;
  screenshotUrls: string[];
  categoryId: string;
  pricingModel: PricingModel;
  freeTrialDays?: number;
  startingPrice?: number;
  hasApi: boolean;
  hasMobileApp: boolean;
  launchYear?: number;
  headquartersCountry?: string;
  founderNames: string[];
  avgRating: number;
  reviewCount: number;
  status: ToolStatus;
  isFeatured: boolean;
  createdAt: string;
}

// ─── Startups & Funding ─────────────────

export enum StartupStage {
  IDEA = 'IDEA',
  PRE_SEED = 'PRE_SEED',
  SEED = 'SEED',
  SERIES_A = 'SERIES_A',
  SERIES_B = 'SERIES_B',
  SERIES_C = 'SERIES_C',
  GROWTH = 'GROWTH',
  PUBLIC = 'PUBLIC',
}

export interface Startup {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  foundedYear?: number;
  headquartersCity?: string;
  stage: StartupStage;
  totalFundingInr: number;
  employeeCount?: number;
  isIndian: boolean;
  isFeatured: boolean;
  impactScore: number;
  createdAt: string;
}

export interface FundingRound {
  id: string;
  startupId: string;
  startup?: Startup;
  roundType: string;
  amountInr: number;
  amountUsd?: number;
  announcedAt: string;
  leadInvestors: string[];
  allInvestors: string[];
  valuation?: number;
  sourceUrl?: string;
}

// ─── Advertising ─────────────────────────

export enum AdZone {
  H1_HERO_FEATURE = 'H1_HERO_FEATURE',
  H2_TRENDING_STRIP = 'H2_TRENDING_STRIP',
  H3_SECTION_SPONSOR = 'H3_SECTION_SPONSOR',
  H4_NEWSLETTER_CTA = 'H4_NEWSLETTER_CTA',
  A1_IN_ARTICLE = 'A1_IN_ARTICLE',
  A2_SIDEBAR_STICKY = 'A2_SIDEBAR_STICKY',
  A3_END_OF_ARTICLE = 'A3_END_OF_ARTICLE',
  D1_TOOL_FEATURED = 'D1_TOOL_FEATURED',
  D2_STARTUP_BOOST = 'D2_STARTUP_BOOST',
  N1_NEWSLETTER_PRIMARY = 'N1_NEWSLETTER_PRIMARY',
  N2_NEWSLETTER_FOOTER = 'N2_NEWSLETTER_FOOTER',
  J1_JOB_BOARD_BOOST = 'J1_JOB_BOARD_BOOST',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface AdCampaign {
  id: string;
  clientName: string;
  clientEmail: string;
  companyName: string;
  companyLogo?: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  totalBudgetPaise: number;
  createdAt: string;
}

export interface AdCreative {
  id: string;
  campaignId: string;
  zone: AdZone;
  headline: string;
  bodyText: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl?: string;
  isActive: boolean;
  impressionCount: number;
  clickCount: number;
}

// ─── Newsletter ──────────────────────────

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  source: string;
  isActive: boolean;
  tags: string[];
  subscribedAt: string;
}

// ─── API Response Envelope ───────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  meta?: PaginationMeta;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
}
