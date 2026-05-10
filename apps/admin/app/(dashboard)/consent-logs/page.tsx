import { Metadata } from 'next';
import ConsentLogsClient from './ConsentLogsClient';

export const metadata: Metadata = {
  title: 'Cookie Consent Logs | Admin',
  description: 'View and analyze cookie consent decisions',
};

export default function ConsentLogsPage() {
  return <ConsentLogsClient />;
}
