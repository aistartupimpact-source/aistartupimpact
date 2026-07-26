import { z } from "zod";

// ============================================================
// Event Creation Schemas (multi-step form)
// ============================================================

export const eventBasicsSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  subtitle: z.string().max(300).optional().nullable(),
  category: z.enum([
    "CONFERENCE",
    "HACKATHON",
    "SUMMIT",
    "WORKSHOP",
    "MEETUP",
    "DEMO_DAY",
    "WEBINAR",
    "NETWORKING",
  ]),
  format: z.enum(["IN_PERSON", "VIRTUAL", "HYBRID"]),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only"
    ),
});

export const eventDateLocationSchema = z
  .object({
    startAt: z.string().datetime({ message: "Valid start date required" }),
    endAt: z.string().datetime({ message: "Valid end date required" }),
    timezone: z.string().default("Asia/Kolkata"),
    // In-person/Hybrid fields
    venueName: z.string().max(200).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    // Virtual/Hybrid fields
    meetingLink: z.string().url().optional().nullable(),
    revealLinkAfterRegistration: z.boolean().default(false),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: "End date must be after start date",
    path: ["endAt"],
  });

export const eventDetailsSchema = z.object({
  description: z.any().optional(), // Tiptap JSON — validated at render time
  coverImageUrl: z.string().url().optional().nullable(),
  galleryImageUrls: z.array(z.string().url()).default([]),
});

export const eventSpeakerSchema = z.object({
  name: z.string().min(1, "Speaker name is required").max(200),
  title: z.string().max(200).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  headshotUrl: z.string().url().optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  talkTitle: z.string().max(300).optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const eventAgendaItemSchema = z.object({
  dayNumber: z.number().int().min(1).default(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional().nullable(),
  speakerId: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const eventTicketTierSchema = z.object({
  name: z.string().min(1).max(100),
  priceCents: z.number().int().min(0).default(0),
  quantity: z.number().int().min(1).optional().nullable(),
  saleStart: z.string().datetime().optional().nullable(),
  saleEnd: z.string().datetime().optional().nullable(),
  tierType: z.enum(["EARLY_BIRD", "REGULAR", "VIP"]).default("REGULAR"),
  description: z.string().max(500).optional().nullable(),
});

export const eventCustomQuestionSchema = z.object({
  questionText: z.string().min(1).max(500),
  questionType: z.enum(["TEXT", "SELECT", "CHECKBOX"]).default("TEXT"),
  options: z.array(z.string()).optional().nullable(),
  required: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const eventSettingsSchema = z.object({
  visibility: z.enum(["PUBLIC", "UNLISTED", "INVITE_ONLY"]).default("PUBLIC"),
  capacity: z.number().int().min(1).optional().nullable(),
  registrationDeadline: z.string().datetime().optional().nullable(),
  approvalRequired: z.boolean().default(false),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  socialImageUrl: z.string().url().optional().nullable(),
  publishAt: z.string().datetime().optional().nullable(),
});

// ============================================================
// Full event creation schema (all steps combined)
// ============================================================

export const createEventSchema = z.object({
  // Step 1 - Basics
  ...eventBasicsSchema.shape,
  // Step 2 - Date & Location
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  timezone: z.string().default("Asia/Kolkata"),
  venueName: z.string().max(200).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  meetingLink: z.string().url().optional().nullable(),
  revealLinkAfterRegistration: z.boolean().default(false),
  // Step 3 - Details
  description: z.any().optional(),
  coverImageUrl: z.string().url().optional().nullable(),
  galleryImageUrls: z.array(z.string().url()).default([]),
  // Step 4 - Tickets
  ticketTiers: z.array(eventTicketTierSchema).default([]),
  // Step 5 - Settings
  visibility: z.enum(["PUBLIC", "UNLISTED", "INVITE_ONLY"]).default("PUBLIC"),
  capacity: z.number().int().min(1).optional().nullable(),
  registrationDeadline: z.string().datetime().optional().nullable(),
  approvalRequired: z.boolean().default(false),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  socialImageUrl: z.string().url().optional().nullable(),
  publishAt: z.string().datetime().optional().nullable(),
  // Nested data
  speakers: z.array(eventSpeakerSchema).default([]),
  agendaItems: z.array(eventAgendaItemSchema).default([]),
  customQuestions: z.array(eventCustomQuestionSchema).default([]),
  tags: z.array(z.string()).default([]), // Tag IDs
});

// ============================================================
// Registration Schema
// ============================================================

export const eventRegistrationSchema = z.object({
  eventId: z.string().min(1),
  // Guest info (for non-logged-in users)
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Valid email required"),
  phone: z.string().max(20).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  role: z.string().max(200).optional().nullable(),
  // Location capture
  locationCity: z.string().max(200).optional().nullable(),
  locationLat: z.number().optional().nullable(),
  locationLng: z.number().optional().nullable(),
  locationCountryCode: z.string().max(2).optional().nullable(),
  locationRegion: z.string().max(200).optional().nullable(),
  // Newsletter consent
  newsletterConsent: z.boolean().default(false),
  // Custom question answers
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        answerText: z.string(),
      })
    )
    .default([]),
  // Ticket tier selection (optional for free events)
  ticketTierId: z.string().optional().nullable(),
});

// ============================================================
// Newsletter Subscribe Schema (standalone form)
// ============================================================

export const eventNewsletterSubscribeSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().min(1).max(200).optional().nullable(),
  locationCity: z.string().max(200).optional().nullable(),
  locationLat: z.number().optional().nullable(),
  locationLng: z.number().optional().nullable(),
  locationCountryCode: z.string().max(2).optional().nullable(),
  locationRegion: z.string().max(200).optional().nullable(),
  consentText: z.string().min(1, "Consent text is required"),
});

// ============================================================
// Type exports
// ============================================================

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
export type EventNewsletterSubscribeInput = z.infer<
  typeof eventNewsletterSubscribeSchema
>;
