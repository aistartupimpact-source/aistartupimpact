"use server";

import { UserRole } from "@prisma/client";
import { prisma } from "@aistartupimpact/database";
import { neon } from '@neondatabase/serverless';
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Resend } from "resend";
import { logAuditEvent } from '@/lib/audit-log';
import { userInvitationHtml } from '@aistartupimpact/utils/src/email-templates';

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
      const { data: resendData, error: resendError } = await resend.emails.send({
        from: `AI Startup Impact <${process.env.RESEND_FROM_EMAIL}>`,
        to: data.email,
        subject: "You've been invited to AI Startup Impact",
        html: userInvitationHtml(data.name, data.role),
      });

      if (resendError) {
        console.error("Resend API Error:", resendError);
        return { success: true, error: `User created, but email failed: ${resendError.message}` };
      }
    }

    revalidatePath("/users");
    
    // Audit log
    await logAuditEvent({
      action: 'CREATE',
      resourceType: 'USER',
      after: { name: data.name, email: data.email, role: data.role },
    });

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
    const before = await prisma.user.findUnique({ where: { id }, select: { name: true, role: true } });

    await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role as UserRole,
      },
      select: { id: true }
    });

    // Audit log
    await logAuditEvent({
      action: 'UPDATE',
      resourceType: 'USER',
      resourceId: id,
      before: before ? { name: before.name, role: before.role } : undefined,
      after: { name: data.name, role: data.role },
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
    // Capture the user data before deletion for audit
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true }
    });

    // Soft delete: deactivate instead of hard delete
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true }
    });

    // Audit log
    await logAuditEvent({
      action: 'DELETE',
      resourceType: 'USER',
      resourceId: id,
      before: user ? { name: user.name, email: user.email, role: user.role } : undefined,
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete user" };
  }
}

// ─── Delete Permission Delegation ───────────────────────────────────────────

export async function grantDeleteAccessAction(userId: string, hours: number) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Only Super Admins can grant delete access' };
  }

  try {
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    await sql`
      UPDATE "User"
      SET "canDeleteUntil" = ${expiresAt.toISOString()}::timestamp,
          "deleteGrantedBy" = ${session.user.id},
          "deleteGrantedAt" = NOW()
      WHERE id = ${userId}
    `;

    // Audit log
    await logAuditEvent({
      action: 'UPDATE',
      resourceType: 'USER',
      resourceId: userId,
      after: { action: 'GRANT_DELETE_ACCESS', hours, expiresAt: expiresAt.toISOString() },
    });

    revalidatePath("/users");
    return { success: true, expiresAt: expiresAt.toISOString() };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to grant access' };
  }
}

export async function revokeDeleteAccessAction(userId: string) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Only Super Admins can revoke delete access' };
  }

  try {
    await sql`
      UPDATE "User"
      SET "canDeleteUntil" = NULL,
          "deleteGrantedBy" = NULL,
          "deleteGrantedAt" = NULL
      WHERE id = ${userId}
    `;

    // Audit log
    await logAuditEvent({
      action: 'UPDATE',
      resourceType: 'USER',
      resourceId: userId,
      after: { action: 'REVOKE_DELETE_ACCESS' },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to revoke access' };
  }
}

export async function getDeletePermissionsAction() {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return [];
  }

  try {
    const users = await sql`
      SELECT id, name, email, role, "canDeleteUntil"::text, "deleteGrantedBy", "deleteGrantedAt"::text
      FROM "User"
      WHERE "canDeleteUntil" IS NOT NULL
      ORDER BY "deleteGrantedAt" DESC
    `;
    return users;
  } catch (error) {
    return [];
  }
}
