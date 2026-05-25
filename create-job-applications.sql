-- Create JobApplication table for careers page submissions
CREATE TABLE IF NOT EXISTS "JobApplication" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  role        TEXT NOT NULL,
  "fullName"  TEXT NOT NULL,
  email       TEXT NOT NULL,
  mobile      TEXT,
  "resumeLink" TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for duplicate check (email + role)
CREATE INDEX IF NOT EXISTS "idx_job_application_email_role"
  ON "JobApplication"(email, role);

-- Index for admin listing
CREATE INDEX IF NOT EXISTS "idx_job_application_created"
  ON "JobApplication"("createdAt" DESC);

-- Verify
SELECT 'JobApplication table created successfully' AS status;
