# Vercel Monorepo Configuration Guide

## Problem
The build is failing because `tailwindcss` and other devDependencies from `apps/web/package.json` are not being installed during Vercel's build process.

## Root Cause
Vercel's default `npm install` only installs 318 packages (root dependencies), but locally we have 1058 packages (including all workspace devDependencies).

## Solution: Configure Vercel Project Settings

### Option 1: Vercel Dashboard Configuration (RECOMMENDED)

Go to your Vercel project settings and configure:

1. **Root Directory**: Leave as `.` (repository root)

2. **Build & Development Settings**:
   - **Framework Preset**: `Other`
   - **Build Command**: `cd apps/web && npm run build`
   - **Output Directory**: `apps/web/.next`
   - **Install Command**: `npm install --include=dev`

### Option 2: Use vercel.json (Alternative)

Create `vercel.json` in the repository root:

```json
{
  "buildCommand": "cd apps/web && npm run build",
  "installCommand": "npm install --include=dev",
  "outputDirectory": "apps/web/.next"
}
```

### Option 3: Separate Vercel Projects (Current Setup)

Since you have **2 separate Vercel projects** (web and admin), you should configure each project to point to its specific app:

#### For Web Project:
- **Root Directory**: `apps/web`
- **Framework Preset**: `Next.js`
- **Build Command**: `npm run build` (or leave default)
- **Install Command**: `npm install`

#### For Admin Project:
- **Root Directory**: `apps/admin`
- **Framework Preset**: `Next.js`
- **Build Command**: `npm run build` (or leave default)
- **Install Command**: `npm install`

## Why This Works

When you set the **Root Directory** to `apps/web` or `apps/admin`, Vercel will:
1. Run `npm install` in that directory
2. Install ALL dependencies (including devDependencies) from that app's `package.json`
3. Properly resolve the monorepo workspace dependencies

## Current Status

- Local build: ✅ Works (1058 packages installed)
- Vercel build: ❌ Fails (only 318 packages installed)

## Next Steps

1. Go to Vercel Dashboard → Your Web Project → Settings → General
2. Set **Root Directory** to `apps/web`
3. Go to Settings → Build & Development Settings
4. Ensure **Framework Preset** is `Next.js`
5. Leave **Build Command** and **Install Command** as default (or empty)
6. Redeploy

Repeat for the Admin project with `apps/admin`.
