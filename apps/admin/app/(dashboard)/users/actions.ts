"use server";

import { UserRole } from "@prisma/client";
import { prisma } from "@aistartupimpact/database";
import { neon } from '@neondatabase/serverless';
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Resend } from "resend";

const sql = neon(process.env.DATABASE_URL!);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper to create a URL-friendly slug from name
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4);
};

export async function getUsers() {
  const session: any = await getServerSession(authOptions);
  if (!session?.user) {
    console.warn("getUsers called without session");
    return [];
  }

  try {
    // Use raw SQL to avoid Prisma DateTime serialization issues
    const users = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u."isActive",
        u."lastLoginAt"::text as "lastLoginAt",
        u."createdAt"::text as "createdAt",
        COUNT(a.id)::int as article_count
      FROM "User" u
      LEFT JOIN "Article" a ON a."authorId" = u.id
      GROUP BY u.id, u.name, u.email, u.role, u."isActive", u."lastLoginAt", u."createdAt"
      ORDER BY u."createdAt" DESC
    `;

    return users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.isActive ? 'ACTIVE' : 'INACTIVE',
      articles: u.article_count,
      lastActive: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function inviteUser(data: { name: string; email: string; role: string }) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Only Super Admins can invite users" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true }
    });

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    await prisma.user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        slug: generateSlug(data.name),
        isActive: true, // Auto-active for this MVP flow since Google Auth manages access
      },
      select: { id: true }
    });

    if (resend && process.env.RESEND_FROM_EMAIL) {
      // Use production URL, never localhost in emails
      const adminUrl = process.env.NODE_ENV === 'production'
        ? (process.env.ADMIN_NEXTAUTH_URL || 'https://admin.aistartupimpact.com')
        : (process.env.ADMIN_NEXTAUTH_URL || 'http://localhost:3001');

      const { data: resendData, error: resendError } = await resend.emails.send({
        from: `AI Startup Impact <${process.env.RESEND_FROM_EMAIL}>`,
        to: data.email,
        subject: "You've been invited to AI Startup Impact",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px;">
              <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">AI Startup Impact</h1>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">Hi ${data.name},</p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              You have been invited to join the AI Startup Impact editorial team as <strong>${data.role.replace(/_/g, " ")}</strong>.
            </p>

            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              Sign in with the Google account associated with this email address to access the admin dashboard.
            </p>

            <div style="margin: 32px 0;">
              <a href="${adminUrl}/login" style="background: #111827; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600;">Sign In to Dashboard</a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
              Best regards,<br/>
              The AI Startup Impact Team
            </p>
          </div>
        `
      });

      if (resendError) {
        console.error("Resend API Error:", resendError);
        // We shouldn't block the user creation if email fails, but we should notify them
        return { success: true, error: `User created, but email failed: ${resendError.message}` };
      }
    }

    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    console.error("Error inviting user:", error);
    return { success: false, error: error.message || "Failed to invite user" };
  }
}

export async function updateUserMode(id: string, data: { name: string; role: string; email: string }) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Only Super Admins can edit users" };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role as UserRole,
      },
      select: { id: true }
    });
    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to update user" };
  }
}

export async function toggleUserStatus(id: string, currentStatus: string) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Only Super Admins can change status" };
  }

  if (session.user.id === id) {
    return { success: false, error: "Cannot deactivate yourself" };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { isActive: currentStatus !== 'ACTIVE' },
      select: { id: true }
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to toggle status" };
  }
}

export async function deleteUser(id: string) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Only Super Admins can delete users" };
  }

  if (session.user.id === id) {
    return { success: false, error: "Cannot delete yourself" };
  }

  try {
    await prisma.user.delete({
      where: { id },
      select: { id: true }
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete user" };
  }
}
