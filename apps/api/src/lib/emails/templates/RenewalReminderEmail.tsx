import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from '@react-email/components';

interface RenewalReminderProps {
  toolName: string;
  tier: string;
  expiresOn: string;
  renewLink: string;
}

export const RenewalReminderEmail = ({
  toolName = 'Your AI Tool',
  tier = 'Featured',
  expiresOn = 'May 14, 2026',
  renewLink = 'https://aistartupimpact.com/founder/dashboard',
}: RenewalReminderProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your {tier} listing for {toolName} expires soon!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Keep {toolName} visible to thousands!</Heading>

          <Text style={text}>
            Your premium <strong>{tier}</strong> listing on AI Startup Impact expires in <strong>7 days</strong> on {expiresOn}.
          </Text>

          <Text style={text}>
            We've loved having you as a featured partner! To ensure there's no interruption in traffic and leads rolling into your site, click below to renew your tier instantly.
            <strong> Bonus: Use code EARLY10 for a 10% discount if you renew today!</strong>
          </Text>

          <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
            <Link href={renewLink} style={button}>
              Renew {tier} Status
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            AI Startup Impact Directory Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};
const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  border: '1px solid #e1e4e8',
  maxWidth: '600px',
  marginTop: '40px',
};
const h1 = { color: '#0d162a', fontSize: '24px', fontWeight: '700', lineHeight: '32px', margin: '0 0 20px 0' };
const text = { color: '#4b5563', fontSize: '16px', lineHeight: '26px', margin: '0 0 16px 0' };
const button = { backgroundColor: '#ab0f2b', borderRadius: '6px', color: '#fff', fontSize: '16px', textDecoration: 'none', display: 'inline-block', padding: '14px 28px', fontWeight: 'bold' };
const hr = { borderColor: '#e5e7eb', margin: '32px 0 24px 0' };
const footer = { color: '#9ca3af', fontSize: '14px', lineHeight: '22px' };

export default RenewalReminderEmail;
