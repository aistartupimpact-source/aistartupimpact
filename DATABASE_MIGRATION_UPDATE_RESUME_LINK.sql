-- Migration: Update JobApplication resumeLink column to support larger data URLs
-- This allows storing base64-encoded PDF files (up to ~400KB as base64)

-- Increase the resumeLink column size from VARCHAR(500) to TEXT
ALTER TABLE "JobApplication" 
ALTER COLUMN "resumeLink" TYPE TEXT;

-- Add a comment to document the change
COMMENT ON COLUMN "JobApplication"."resumeLink" IS 'Can store URLs or base64 data URLs for uploaded resumes';
