import { sendEmail } from '../lib/email';
import { ApprovalEmail } from '../lib/emails/templates/ApprovalEmail';
import { StoryInvitationEmail } from '../lib/emails/templates/StoryInvitationEmail';
import { FundingFeatureEmail } from '../lib/emails/templates/FundingFeatureEmail';
import * as React from 'react';

// Normally, these emails would be pulled from a queue (BullMQ/Redis) or invoked directly on save action. 
export async function dispatchToolApprovalEmail(recipientEmail: string, toolName: string, toolSlug: string) {
  return sendEmail({
    to: recipientEmail,
    subject: `Your AI Tool ${toolName} has been approved!`,
    react: ApprovalEmail({ toolName, toolSlug }) as React.ReactElement,
  });
}

export async function dispatchStoryInvitationEmail(recipientEmail: string, toolName: string) {
  return sendEmail({
    to: recipientEmail,
    subject: `We want to feature ${toolName}'s story`,
    react: StoryInvitationEmail({ toolName }) as React.ReactElement,
  });
}

export async function dispatchFundingFeatureEmail(recipientEmail: string, startupName: string, fundingAmount: string) {
  return sendEmail({
    to: recipientEmail,
    subject: `${startupName} Funding News Featured on AI Startup Impact`,
    react: FundingFeatureEmail({ startupName, fundingAmount }) as React.ReactElement,
  });
}
