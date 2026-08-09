function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  return url && !url.includes('localhost') ? url : 'https://aistartupimpact.com';
}

function emailWrapper(content: string, accentColor = '#6366f1'): string {
  const siteUrl = getSiteUrl();
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="border-bottom: 3px solid ${accentColor}; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">AI Startup Impact</h1>
  </div>
  ${content}
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
  <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
    Best regards,<br/>
    The AI Startup Impact Team<br/>
    <a href="${siteUrl}" style="color: #6366f1; text-decoration: none;">${siteUrl}</a>
  </p>
</div>`;
}

function primaryButton(href: string, label: string): string {
  return `<a href="${href}" style="background: #111827; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600;">${label}</a>`;
}

function secondaryButton(href: string, label: string): string {
  return `<a href="${href}" style="background: #ffffff; color: #374151; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600; border: 1px solid #d1d5db; margin-left: 12px;">${label}</a>`;
}

function infoBox(label: string, content: string): string {
  return `<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
  <p style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; font-weight: 600;">${label}</p>
  ${content}
</div>`;
}

export function startupApprovalHtml(name: string, founderName: string, slug: string): string {
  const siteUrl = getSiteUrl();
  const liveUrl = `${siteUrl}/startups/${slug}`;
  const dashboardUrl = `${siteUrl}/founder/dashboard`;

  return emailWrapper(`
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">Hi ${founderName || 'there'},</p>

  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
    Your startup <strong>"${name}"</strong> has been reviewed and approved by our editorial team. Your listing is now live and visible to investors, enterprise buyers, and the broader AI ecosystem.
  </p>

  ${infoBox('Your Live Listing', `<a href="${liveUrl}" style="color: #6366f1; font-size: 15px; font-weight: 600; text-decoration: none;">${liveUrl}</a>`)}

  <div style="margin: 32px 0;">
    ${primaryButton(liveUrl, 'View Your Listing')}
    ${secondaryButton(dashboardUrl, 'Founder Dashboard')}
  </div>

  <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <p style="color: #4338ca; font-size: 14px; font-weight: 700; margin: 0 0 8px 0;">Get Your Verified Badge</p>
    <p style="color: #374151; font-size: 14px; line-height: 1.5; margin: 0;">
      Verifying your startup through the DNS will help you get a verified badge and increase trust with investors and enterprise buyers. You can configure this easily from your <a href="${dashboardUrl}" style="color: #6366f1; font-weight: 600; text-decoration: none;">Founder Dashboard</a>.
    </p>
  </div>

  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 8px;">
    To increase visibility, we recommend sharing your listing on LinkedIn and with your network.
  </p>`);
}

export function toolApprovalHtml(name: string, founderName: string, slug: string): string {
  const siteUrl = getSiteUrl();
  const liveUrl = `${siteUrl}/tools/${slug}`;
  const dashboardUrl = `${siteUrl}/founder/dashboard`;

  return emailWrapper(`
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">Hi ${founderName || 'there'},</p>

  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
    Your AI tool <strong>"${name}"</strong> has been reviewed and approved by our editorial team. Your listing is now live and discoverable by developers, enterprise buyers, and the broader AI community.
  </p>

  ${infoBox('Your Live Listing', `<a href="${liveUrl}" style="color: #6366f1; font-size: 15px; font-weight: 600; text-decoration: none;">${liveUrl}</a>`)}

  <div style="margin: 32px 0;">
    ${primaryButton(liveUrl, 'View Your Listing')}
    ${secondaryButton(dashboardUrl, 'Founder Dashboard')}
  </div>

  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 8px;">
    To increase visibility, we recommend sharing your listing on LinkedIn and with your network.
  </p>`);
}

export function startupRejectionHtml(
  name: string,
  founderName: string,
  reason: string,
  details: { tagline?: string; description?: string; stage?: string; websiteUrl?: string }
): string {
  const siteUrl = getSiteUrl();
  const dashboardUrl = `${siteUrl}/founder/dashboard`;

  return emailWrapper(`
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">Hi ${founderName || 'there'},</p>

  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
    Thank you for submitting <strong>"${name}"</strong> to AI Startup Impact. We appreciate your patience while our editorial team reviewed your application.
  </p>

  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
    After careful review, we unfortunately cannot approve your listing in its current state. Please see the details of our review feedback below:
  </p>

  <div style="background: #fdf2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <p style="color: #b91c1c; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; font-weight: 600;">Feedback from Editorial Team</p>
    <p style="color: #7f1d1d; font-size: 15px; line-height: 1.6; margin: 0; font-style: italic;">"${reason}"</p>
  </div>

  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
    For your reference, here are the details that were submitted:
  </p>

  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <p style="margin: 0 0 12px 0; color: #111827; font-weight: 600; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Submitted Profile Details</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 6px 0; color: #6b7280; width: 35%; font-weight: 500;">Startup Name</td><td style="padding: 6px 0; color: #111827; font-weight: 600;">${name}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280; font-weight: 500;">Tagline</td><td style="padding: 6px 0; color: #374151;">${details.tagline || 'N/A'}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280; vertical-align: top; font-weight: 500;">Description</td><td style="padding: 6px 0; color: #374151; line-height: 1.4;">${details.description || 'N/A'}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280; font-weight: 500;">Stage</td><td style="padding: 6px 0; color: #374151;">${details.stage || 'N/A'}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280; font-weight: 500;">Website</td><td style="padding: 6px 0; color: #374151;">${details.websiteUrl ? `<a href="${details.websiteUrl}" style="color: #6366f1; text-decoration: none;">${details.websiteUrl}</a>` : 'N/A'}</td></tr>
    </table>
  </div>

  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
    Please verify the fields once, update any incorrect details or add missing information, and submit again for approval.
  </p>

  <div style="margin: 32px 0;">
    ${primaryButton(dashboardUrl, 'Edit & Re-submit Listing')}
  </div>`, '#ef4444');
}

export function userInvitationHtml(name: string, role: string): string {
  const adminUrl = process.env.NODE_ENV === 'production'
    ? (process.env.ADMIN_NEXTAUTH_URL || 'https://admin.aistartupimpact.com')
    : (process.env.ADMIN_NEXTAUTH_URL || 'http://localhost:3001');

  return emailWrapper(`
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">Hi ${name},</p>

  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
    You have been invited to join the AI Startup Impact editorial team as <strong>${role.replace(/_/g, ' ')}</strong>.
  </p>

  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
    Sign in with the Google account associated with this email address to access the admin dashboard.
  </p>

  <div style="margin: 32px 0;">
    ${primaryButton(`${adminUrl}/login`, 'Sign In to Dashboard')}
  </div>`);
}

export function submissionReceivedHtml(name: string, entityType: 'startup' | 'tool', entityName: string): string {
  const siteUrl = getSiteUrl();

  return emailWrapper(`
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">Hi ${name},</p>

  <p style="color: #374151; font-size: 16px; line-height: 1.6;">Thank you for submitting "${entityName}" to AI Startup Impact.</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6;">Our team will review your submission within 2-3 business days.</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6;"><strong>Status:</strong> Pending Review</p>

  <div style="margin: 30px 0;">
    ${primaryButton(`${siteUrl}/founder/dashboard`, 'View in Dashboard')}
  </div>`);
}

export function verificationEmailHtml(name: string, verifyUrl: string): string {
  return emailWrapper(`
  <h2 style="color: #1f2937;">Welcome to AI Startup Impact, ${name}!</h2>
  <p style="color: #4b5563; line-height: 1.6;">Please verify your email address by clicking the button below:</p>
  <div style="margin: 30px 0;">
    <a href="${verifyUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
  </div>
  <p style="color: #6b7280; font-size: 14px;">Or copy this link: ${verifyUrl}</p>
  <p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours.</p>
  <p style="color: #6b7280; font-size: 14px;">If you didn't create an account, please ignore this email.</p>`);
}

export function passwordResetHtml(name: string, resetUrl: string): string {
  return emailWrapper(`
  <h2 style="color: #1f2937;">Password Reset Request</h2>
  <p style="color: #4b5563; line-height: 1.6;">Hi ${name},</p>
  <p style="color: #4b5563; line-height: 1.6;">Click the button below to reset your password:</p>
  <div style="margin: 30px 0;">
    <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
  </div>
  <p style="color: #6b7280; font-size: 14px;">Or copy this link: ${resetUrl}</p>
  <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour.</p>
  <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>`);
}

export function jobApplicationHtml(name: string, role: string): string {
  return emailWrapper(`
  <h2 style="color: #1f2937;">Application Received</h2>
  <p style="color: #4b5563; line-height: 1.6;">Hi ${name},</p>
  <p style="color: #4b5563; line-height: 1.6;">Thank you for applying for the <strong>${role}</strong> position at AI Startup Impact.</p>
  <p style="color: #4b5563; line-height: 1.6;">We've received your application and will review it carefully. If your profile is a good match, we'll reach out to schedule the next steps.</p>
  <p style="color: #6b7280; font-size: 14px;">This is an automated confirmation — no reply needed.</p>`);
}

export function paymentSuccessHtml(toolName: string, founderName: string, tier: string): string {
  const siteUrl = getSiteUrl();
  const dashboardUrl = `${siteUrl}/founder/dashboard`;

  return emailWrapper(`
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">Hi ${founderName || 'there'},</p>

  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
    Your payment has been successfully processed! Your AI tool <strong>"${toolName}"</strong> has been upgraded to the <strong>${tier}</strong> tier.
  </p>

  <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <p style="color: #166534; font-size: 14px; font-weight: 700; margin: 0 0 8px 0;">Payment Confirmed</p>
    <p style="color: #374151; font-size: 14px; line-height: 1.5; margin: 0;">
      Your listing now includes all ${tier} features. Changes are live immediately.
    </p>
  </div>

  <div style="margin: 32px 0;">
    ${primaryButton(dashboardUrl, 'View Dashboard')}
  </div>`);
}

export function newsletterConfirmHtml(confirmUrl: string): string {
  return emailWrapper(`
  <h2 style="color: #1f2937;">Confirm your subscription</h2>
  <p style="color: #4b5563; line-height: 1.6;">Thanks for signing up for the AI Startup Impact newsletter!</p>
  <p style="color: #4b5563; line-height: 1.6;">Please click the button below to confirm your email address and start receiving our weekly digest.</p>
  <div style="margin: 30px 0; text-align: center;">
    ${primaryButton(confirmUrl, 'Confirm Subscription')}
  </div>
  <p style="color: #6b7280; font-size: 14px;">Or copy this link: ${confirmUrl}</p>
  <p style="color: #6b7280; font-size: 14px;">This link expires in 7 days. If you didn't sign up, you can safely ignore this email.</p>`);
}

export function newsletterWelcomeHtml(isResubscribe = false): string {
  const siteUrl = getSiteUrl();

  if (isResubscribe) {
    return emailWrapper(`
    <h2 style="color: #1f2937;">Welcome Back!</h2>
    <p style="color: #4b5563; line-height: 1.6;">You've been re-subscribed to the AI Startup Impact newsletter.</p>
    <p style="color: #4b5563; line-height: 1.6;">You'll receive our weekly digest with the latest AI startups, tools, and industry insights.</p>
    <div style="margin: 30px 0;">
      ${primaryButton(siteUrl, 'Visit AI Startup Impact')}
    </div>`);
  }

  return emailWrapper(`
  <h2 style="color: #1f2937;">Welcome to AI Startup Impact!</h2>
  <p style="color: #4b5563; line-height: 1.6;">Thank you for subscribing to our newsletter.</p>
  <p style="color: #4b5563; line-height: 1.6;">Every week, you'll get curated updates on the most impactful AI startups, tools, funding rounds, and industry insights.</p>
  <div style="margin: 30px 0;">
    ${primaryButton(siteUrl, 'Explore AI Startups & Tools')}
  </div>`);
}
