import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { registrationRateLimit } from "@/lib/event-rate-limit";
import { generateQrToken } from "@/lib/events/qr-token";
import { sendRegistrationConfirmationEmail, sendNewsletterWelcomeEmail } from "@/lib/events/email";
import { generateGoogleCalendarUrl } from "@/lib/events/calendar";

export const dynamic = "force-dynamic";

const CONSENT_TEXT =
  "Keep me updated about upcoming AI events, conferences, and opportunities in my area. You can unsubscribe anytime.";
const CONSENT_VERSION = 1;

export async function POST(request: NextRequest) {
  // Rate limit
  const identifier = getClientIdentifier(request);
  const { success } = await checkRateLimit(registrationRateLimit, identifier);
  if (!success) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait and try again." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { eventId, name, email, phone, company, role, occupation, locationCity, newsletterConsent, whatsappConsent, ticketTierId, answers } = body;

    // Basic validation
    if (!eventId || !name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required." },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Fetch event and check availability (with row lock for capacity)
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        status: true,
        capacity: true,
        registrationCount: true,
        registrationDeadline: true,
        startAt: true,
        approvalRequired: true,
        deletedAt: true,
        tags: { select: { tagId: true } },
      },
    });

    if (!event || event.deletedAt || event.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, error: "Event not found or not available." },
        { status: 404 }
      );
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      return NextResponse.json(
        { success: false, error: "Registration deadline has passed." },
        { status: 400 }
      );
    }

    // Check capacity
    if (event.capacity && event.registrationCount >= event.capacity) {
      return NextResponse.json(
        { success: false, error: "This event is full." },
        { status: 400 }
      );
    }

    // Check for duplicate registration
    const existingReg = await prisma.eventRegistration.findUnique({
      where: { eventId_guestEmail: { eventId, guestEmail: email } },
    });

    if (existingReg && !existingReg.deletedAt) {
      return NextResponse.json(
        { success: false, error: "You are already registered for this event." },
        { status: 409 }
      );
    }

    // Generate QR token
    const qrToken = generateQrToken(16);

    // Determine status
    const status = event.approvalRequired ? "WAITLISTED" : "CONFIRMED";

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        guestName: name,
        guestEmail: email,
        guestPhone: phone || null,
        guestCompany: company || null,
        guestRole: role || null,
        guestOccupation: occupation || null,
        whatsappConsent: whatsappConsent || false,
        ticketTierId: ticketTierId || null,
        status,
        qrToken,
      },
    });

    // Save custom question answers
    if (answers && answers.length > 0) {
      await prisma.eventRegistrationAnswer.createMany({
        data: answers
          .filter((a: any) => a.answerText)
          .map((a: any) => ({
            registrationId: registration.id,
            questionId: a.questionId,
            answerText: a.answerText,
          })),
      });
    }

    // Newsletter subscription (if consent given)
    if (newsletterConsent) {
      // Check if previously unsubscribed — respect their choice
      const existingSub = await prisma.eventSubscriber.findUnique({
        where: { email },
      });

      let isNewSubscriber = false;
      let subscriberId: string | null = null;

      if (!existingSub) {
        // New subscriber — look up city coordinates
        let lat: number | null = null;
        let lng: number | null = null;
        let countryCode: string | null = null;
        let region: string | null = null;

        if (locationCity) {
          // Extract city name (before the comma) for lookup
          const cityName = locationCity.split(",")[0]?.trim();
          if (cityName) {
            const cityRecord = await prisma.city.findFirst({
              where: {
                OR: [
                  { name: { equals: cityName, mode: "insensitive" } },
                  { aliases: { has: cityName.toLowerCase() } },
                ],
              },
              select: { latitude: true, longitude: true, country: true, state: true },
            });
            if (cityRecord) {
              lat = cityRecord.latitude;
              lng = cityRecord.longitude;
              countryCode = cityRecord.country === "India" ? "IN" : cityRecord.country?.slice(0, 2).toUpperCase() || null;
              region = cityRecord.state || null;
            }
          }
        }

        const subscriber = await prisma.eventSubscriber.create({
          data: {
            email,
            name,
            locationCity: locationCity || null,
            locationLat: lat,
            locationLng: lng,
            locationCountryCode: countryCode,
            locationRegion: region,
            subscribed: true,
            consentAt: new Date(),
            consentSource: `event_registration:${eventId}`,
            consentText: CONSENT_TEXT,
            consentVersion: CONSENT_VERSION,
          },
        });
        isNewSubscriber = true;
        subscriberId = subscriber.id;

        // ─── DUAL-WRITE: Also add to main NewsletterSubscriber table (admin Marketing → Subscribers) ───
        try {
          await prisma.newsletterSubscriber.upsert({
            where: { email },
            update: { isActive: true, tags: { push: "events" } },
            create: {
              id: crypto.randomUUID(),
              email,
              name,
              source: `event_registration:${eventId}`,
              isActive: true,
              subscribedAt: new Date(),
              tags: ["events", locationCity || ""].filter(Boolean),
            },
          });
        } catch (e) {
          // Non-critical — don't block registration if this fails
          console.error("NewsletterSubscriber dual-write error:", e);
        }

        // Add interests based on event tags
        if (event.tags.length > 0) {
          await prisma.eventSubscriberInterest.createMany({
            data: event.tags.map((t) => ({
              subscriberId: subscriber.id,
              tagId: t.tagId,
            })),
            skipDuplicates: true,
          });
        }
      } else if (existingSub.subscribed && !existingSub.unsubscribedAt) {
        // Already subscribed — just add new interests
        subscriberId = existingSub.id;
        if (event.tags.length > 0) {
          await prisma.eventSubscriberInterest.createMany({
            data: event.tags.map((t) => ({
              subscriberId: existingSub.id,
              tagId: t.tagId,
            })),
            skipDuplicates: true,
          });
        }
        // Update location if they provided a new one
        if (locationCity && !existingSub.locationCity) {
          await prisma.eventSubscriber.update({
            where: { id: existingSub.id },
            data: { locationCity },
          });
        }
      }
      // If previously unsubscribed (unsubscribedAt is set), do NOT resubscribe

      // Send newsletter welcome email to new subscribers
      if (isNewSubscriber && subscriberId) {
        sendNewsletterWelcomeEmail(email, name, subscriberId).catch(() => {});
      }
    }

    // ─── Send confirmation email ───
    // Fetch full event details for the email
    const eventForEmail = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        title: true,
        slug: true,
        startAt: true,
        endAt: true,
        timezone: true,
        venueName: true,
        address: true,
        format: true,
      },
    });

    if (eventForEmail) {
      const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aistartupimpact.com";
      const eventUrl = `${SITE_URL}/events/${eventForEmail.slug}`;

      const eventDate = eventForEmail.startAt.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const eventTime = eventForEmail.startAt.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const location = eventForEmail.venueName
        ? `${eventForEmail.venueName}${eventForEmail.address ? `, ${eventForEmail.address}` : ""}`
        : eventForEmail.format === "VIRTUAL"
        ? "Virtual"
        : undefined;

      const googleCalUrl = generateGoogleCalendarUrl({
        title: eventForEmail.title,
        description: `Registered via AI Startup Impact`,
        startAt: eventForEmail.startAt.toISOString(),
        endAt: eventForEmail.endAt.toISOString(),
        timezone: eventForEmail.timezone,
        location,
        url: eventUrl,
      });

      // Fire and forget — don't block the response
      sendRegistrationConfirmationEmail(email, name, {
        eventTitle: eventForEmail.title,
        eventSlug: eventForEmail.slug,
        eventDate,
        eventTime,
        eventTimezone: eventForEmail.timezone,
        venueName: eventForEmail.venueName || undefined,
        address: eventForEmail.address || undefined,
        format: eventForEmail.format,
        qrToken,
        googleCalendarUrl: googleCalUrl,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: {
        registrationId: registration.id,
        status: registration.status,
        qrToken: registration.qrToken,
      },
    });
  } catch (error: any) {
    console.error("Event registration error:", error);

    // Handle unique constraint violation (double-click)
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "You are already registered for this event." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
