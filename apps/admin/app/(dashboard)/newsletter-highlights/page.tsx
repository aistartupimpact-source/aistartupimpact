import { Metadata } from 'next';
import NewsletterHighlightsClient from './NewsletterHighlightsClient';

export const metadata: Metadata = {
  title: 'Newsletter Highlights | Admin',
  description: 'Manage newsletter highlights shown on the newsletter page',
};

export default function NewsletterHighlightsPage() {
  return <NewsletterHighlightsClient />;
}
