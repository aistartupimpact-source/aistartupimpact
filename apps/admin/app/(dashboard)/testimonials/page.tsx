import { Metadata } from 'next';
import TestimonialsClient from './TestimonialsClient';

export const metadata: Metadata = {
  title: 'Newsletter Testimonials | Admin',
  description: 'Manage newsletter testimonials',
};

export default function TestimonialsPage() {
  return <TestimonialsClient />;
}
