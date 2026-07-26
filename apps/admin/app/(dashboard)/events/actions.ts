"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@aistartupimpact/database";
import { revalidatePath } from "next/cache";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { logAuditEvent, canDelete } from '@/lib/audit-log';

const EVENT_ROLES = ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "EVENT_ORGANIZER"];

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

// ─────────────────────────────────────────────────────────
// Upload event image
// ─────────────────────────────────────────────────────────

export async function uploadEventImageAction(formData: FormData) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !EVENT_ROLES.includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) return { success: false, error: "Storage not configured" };

    const uniqueId = crypto.randomUUID();
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `events/${uniqueId}-${cleanFilename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        ContentType: file.type,
        Body: buffer,
      })
    );

    const url = process.env.R2_PUBLIC_URL
      ? `${process.env.R2_PUBLIC_URL}/${fileKey}`
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/media/${fileKey}`;

    return { success: true, data: { url } };
  } catch (error: any) {
    console.error("Event image upload error:", error);
    return { success: false, error: error.message || "Upload failed" };
  }
}

// ─────────────────────────────────────────────────────────
// Create or update event (draft save)
// ─────────────────────────────────────────────────────────

export async function saveEventAction(data: any) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !EVENT_ROLES.includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const eventId = data.id;
    const isUpdate = !!eventId;

    // Check ownership for updates
    if (isUpdate) {
      const existing = await prisma.event.findUnique({
        where: { id: eventId },
        select: { organizerId: true },
      });
      if (!existing) return { success: false, error: "Event not found" };
      const isAdmin = ["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role);
      if (!isAdmin && existing.organizerId !== session.user.id) {
        return { success: false, error: "Not authorized to edit this event" };
      }
    }

    // Prepare event data
    const eventData = {
      title: data.title,
      slug: data.slug,
      subtitle: data.subtitle || null,
      category: data.category,
      format: data.format,
      status: data.status || "DRAFT",
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      timezone: data.timezone || "Asia/Kolkata",
      venueName: data.venueName || null,
      address: data.address || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      meetingLink: data.meetingLink || null,
      revealLinkAfterRegistration: data.revealLinkAfterRegistration || false,
      coverImageUrl: data.coverImageUrl || null,
      galleryImageUrls: data.galleryImageUrls || [],
      description: data.description || null,
      capacity: data.capacity || null,
      visibility: data.visibility || "PUBLIC",
      registrationDeadline: data.registrationDeadline
        ? new Date(data.registrationDeadline)
        : null,
      approvalRequired: data.approvalRequired || false,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      socialImageUrl: data.socialImageUrl || null,
      publishAt: data.publishAt ? new Date(data.publishAt) : null,
    };

    let event;

    if (isUpdate) {
      event = await prisma.event.update({
        where: { id: eventId },
        data: eventData,
      });
    } else {
      // Generate a unique 6-char shortCode
      const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      event = await prisma.event.create({
        data: {
          ...eventData,
          organizerId: session.user.id,
          shortCode,
        },
      });
    }

    // ─── Save speakers ───
    if (data.speakers && data.speakers.length > 0) {
      // Delete existing speakers and recreate
      await prisma.eventSpeaker.deleteMany({ where: { eventId: event.id } });
      await prisma.eventSpeaker.createMany({
        data: data.speakers.map((s: any, i: number) => ({
          eventId: event.id,
          name: s.name,
          title: s.title || null,
          company: s.company || null,
          headshotUrl: s.headshotUrl || null,
          bio: s.bio || null,
          talkTitle: s.talkTitle || null,
          sortOrder: i,
        })),
      });
    }

    // ─── Save agenda items ───
    if (data.agendaItems && data.agendaItems.length > 0) {
      await prisma.eventAgendaItem.deleteMany({ where: { eventId: event.id } });
      await prisma.eventAgendaItem.createMany({
        data: data.agendaItems.map((a: any, i: number) => ({
          eventId: event.id,
          dayNumber: a.dayNumber || 1,
          startTime: a.startTime,
          endTime: a.endTime,
          title: a.title,
          description: a.description || null,
          speakerId: a.speakerId || null,
          sortOrder: i,
        })),
      });
    }

    // ─── Save ticket tiers ───
    if (data.ticketTiers && data.ticketTiers.length > 0) {
      await prisma.eventTicketTier.deleteMany({ where: { eventId: event.id } });
      await prisma.eventTicketTier.createMany({
        data: data.ticketTiers.map((t: any) => ({
          eventId: event.id,
          name: t.name,
          priceCents: t.priceCents || 0,
          quantity: t.quantity || null,
          saleStart: t.saleStart ? new Date(t.saleStart) : null,
          saleEnd: t.saleEnd ? new Date(t.saleEnd) : null,
          tierType: t.tierType || "REGULAR",
          description: t.description || null,
        })),
      });
    }

    // ─── Save custom questions ───
    if (data.customQuestions && data.customQuestions.length > 0) {
      await prisma.eventCustomQuestion.deleteMany({
        where: { eventId: event.id },
      });
      await prisma.eventCustomQuestion.createMany({
        data: data.customQuestions.map((q: any, i: number) => ({
          eventId: event.id,
          questionText: q.questionText,
          questionType: q.questionType || "TEXT",
          options: q.options || null,
          required: q.required || false,
          sortOrder: i,
        })),
      });
    }

    // ─── Save tag mappings ───
    if (data.tags && data.tags.length > 0) {
      await prisma.eventTagMapping.deleteMany({ where: { eventId: event.id } });
      await prisma.eventTagMapping.createMany({
        data: data.tags.map((tagId: string) => ({
          eventId: event.id,
          tagId,
        })),
      });
    }

    revalidatePath("/events");

    // Audit log
    await logAuditEvent({
      action: data.id ? 'UPDATE' : 'CREATE',
      resourceType: 'EVENT',
      resourceId: event.id,
      after: { title: data.title, slug: event.slug },
    });

    return { success: true, data: { id: event.id, slug: event.slug } };
  } catch (error: any) {
    console.error("Save event error:", error);
    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      return { success: false, error: "This slug is already taken. Choose a different one." };
    }
    return { success: false, error: error.message || "Failed to save event" };
  }
}

// ─────────────────────────────────────────────────────────
// Publish event
// ─────────────────────────────────────────────────────────

export async function publishEventAction(eventId: string) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !EVENT_ROLES.includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true, status: true },
    });

    if (!event) return { success: false, error: "Event not found" };

    const isAdmin = ["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role);
    if (!isAdmin && event.organizerId !== session.user.id) {
      return { success: false, error: "Not authorized" };
    }

    await prisma.event.update({
      where: { id: eventId },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    revalidatePath("/events");
    return { success: true };
  } catch (error: any) {
    console.error("Publish event error:", error);
    return { success: false, error: error.message || "Failed to publish" };
  }
}

// ─────────────────────────────────────────────────────────
// Delete event (soft delete)
// ─────────────────────────────────────────────────────────

export async function deleteEventAction(eventId: string) {
  // Only SUPER_ADMIN can delete
  const { allowed, error } = await canDelete();
  if (!allowed) {
    return { success: false, error: error || 'Unauthorized' };
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true, title: true, slug: true },
    });

    if (!event) return { success: false, error: "Event not found" };

    await prisma.event.update({
      where: { id: eventId },
      data: { deletedAt: new Date() },
    });

    // Audit log
    await logAuditEvent({
      action: 'DELETE',
      resourceType: 'EVENT',
      resourceId: eventId,
      before: { title: (event as any).title, slug: (event as any).slug },
    });

    revalidatePath("/events");
    return { success: true };
  } catch (error: any) {
    console.error("Delete event error:", error);
    return { success: false, error: error.message || "Failed to delete" };
  }
}

// ─────────────────────────────────────────────────────────
// Fetch event tags for the tag selector
// ─────────────────────────────────────────────────────────

export async function getEventTagsAction() {
  try {
    const tags = await prisma.eventTag.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return { success: true, data: tags };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────
// Check slug availability
// ─────────────────────────────────────────────────────────

export async function checkSlugAction(slug: string, excludeId?: string) {
  try {
    const existing = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing && existing.id !== excludeId) {
      return { available: false };
    }
    return { available: true };
  } catch {
    return { available: false };
  }
}
