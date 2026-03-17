"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const ALLOWED_ROLES = ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_WRITER", "WRITER"];

function getPublicUrl(key: string) {
  // R2_PUBLIC_URL should be set to your bucket's public URL, e.g.:
  //   https://pub-xxxx.r2.dev  (enable "Allow Public Access" in Cloudflare R2 dashboard)
  //   or a custom domain connected to the bucket
  if (process.env.R2_PUBLIC_URL) return `${process.env.R2_PUBLIC_URL}/${key}`;
  // Dev fallback: proxy through the API server
  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/media/${key}`;
}

export async function listMediaAction() {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return { success: false, error: "Unauthorized", data: [] };
  }
  try {
    const bucket = process.env.R2_BUCKET_NAME!;
    const res = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: "uploads/" }));
    const files = (res.Contents || [])
      .filter((item) => item.Key && item.Key !== "uploads/")
      .map((item) => ({
        id: item.Key!,
        name: item.Key!.replace("uploads/", ""),
        size: `${Math.round((item.Size || 0) / 1024)} KB`,
        uploadedAt: item.LastModified ? item.LastModified.toISOString() : "",
        url: getPublicUrl(item.Key!),
      }))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return { success: true, data: files };
  } catch (e: any) {
    console.error("listMediaAction error:", e);
    return { success: false, error: e.message, data: [] };
  }
}

export async function uploadMediaFileAction(formData: FormData) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };
    const bucket = process.env.R2_BUCKET_NAME!;
    const uniqueId = crypto.randomUUID();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `uploads/${uniqueId}-${cleanName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: file.type, Body: buffer }));
    return { success: true, data: { id: key, name: cleanName, url: getPublicUrl(key), size: `${Math.round(buffer.length / 1024)} KB`, uploadedAt: new Date().toISOString() } };
  } catch (e: any) {
    console.error("uploadMediaFileAction error:", e);
    return { success: false, error: e.message };
  }
}

export async function uploadLogoAction(formData: FormData) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return { success: false, error: 'Unauthorized' };
  }
  try {
    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'No file provided' };
    const bucket = process.env.R2_BUCKET_NAME!;
    const uniqueId = crypto.randomUUID();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `logos/${uniqueId}-${cleanName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: file.type, Body: buffer }));
    return { success: true, url: getPublicUrl(key) };
  } catch (e: any) {
    console.error('uploadLogoAction error:', e);
    return { success: false, error: e.message };
  }
}

export async function deleteMediaAction(key: string) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    const bucket = process.env.R2_BUCKET_NAME!;
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return { success: true };
  } catch (e: any) {
    console.error("deleteMediaAction error:", e);
    return { success: false, error: e.message };
  }
}
