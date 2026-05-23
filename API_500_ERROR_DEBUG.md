# API 500 Error Debug - In Progress 🔍

## Issue
All tool "Visit Website" buttons showing HTTP 500 error:
```
http://localhost:3000/api/tools/click?toolId=...&source=...
This page isn't working
localhost is currently unable to handle this request.
HTTP ERROR 500
```

## Changes Made

### 1. Added Comprehensive Error Handling
Wrapped entire GET handler in try-catch to prevent unhandled errors.

### 2. Added Debug Logging
Added console.log statements at each step to trace execution:
- Request parameters
- Database query
- Tool data
- URL validation
- Redirect URL

### 3. Removed Rate Limiting & Bot Detection (Temporarily)
Simplified the flow to isolate the issue:
- Removed `isBot()` check
- Removed `checkRateLimit()` check
- These can be re-added once redirect works

### 4. Enhanced Error Response
Now returns detailed error information:
```typescript
{
  error: 'Internal server error',
  details: error.message,
  stack: error.stack  // For debugging
}
```

## Current Flow

```
1. Receive request with toolId and source
2. Log parameters ✓
3. Validate parameters ✓
4. Fetch tool from database ✓
5. Log tool data ✓
6. Build redirect URL ✓
7. Add https:// if needed ✓
8. Validate URL format ✓
9. Track click (async, non-blocking) ✓
10. Redirect to tool website ✓
```

## Next Steps to Debug

### Check Server Logs
Look at the terminal where `npm run dev` is running. You should see console.log output showing:
- "Click API called: { toolId: '...', source: '...' }"
- "Fetching tool from database..."
- "Tool found: { name: '...', websiteUrl: '...', ... }"
- "Redirect URL: https://..."
- "Redirecting to: https://..."

### If You See an Error
The error message will show exactly what's failing:
- Database connection issue?
- Invalid tool ID?
- Missing URL?
- Invalid URL format?

### Test the API Directly
Open this URL in your browser (replace with actual toolId):
```
http://localhost:3000/api/tools/click?toolId=766ba72e-5001-4da9-b1f4-7563c22d7cbb&source=TOOL_DETAIL
```

You should either:
- **Success**: Redirect to the tool's website
- **Error**: See JSON error response with details

## Possible Causes

### 1. Database Connection Issue
- Prisma client not initialized
- DATABASE_URL not set
- Database not accessible

### 2. Tool Data Issue
- Tool doesn't exist
- websiteUrl is null
- websiteUrl is empty string
- affiliateUrl is null

### 3. URL Format Issue
- URL contains invalid characters
- URL is not a valid format
- URL is missing domain

### 4. Import Issue
- `prisma` import failing
- `trackToolClick` import failing
- Missing dependencies

## Files Modified
- `/apps/web/app/api/tools/click/route.ts` - Added error handling and debug logging

## What to Look For

### In Browser
- Does it redirect or show error?
- If error, what's the JSON response?

### In Terminal (Server Logs)
- What console.log messages appear?
- Any error stack traces?
- Any Prisma errors?

### In Database
- Does the tool with that ID exist?
- Does it have a websiteUrl?
- Is the URL valid?

## Quick Database Check

Run this query to check the tool:
```sql
SELECT id, name, "websiteUrl", "affiliateUrl"
FROM "AiTool"
WHERE id = '766ba72e-5001-4da9-b1f4-7563c22d7cbb';
```

Expected result:
- Tool exists ✓
- websiteUrl is not null ✓
- websiteUrl is a valid URL ✓

## Status
🟡 **DEBUGGING** - Added comprehensive logging and error handling. Check server logs for details.

## Action Required
1. Click a "Visit Website" button
2. Check the terminal where `npm run dev` is running
3. Look for console.log output
4. Share any error messages you see
