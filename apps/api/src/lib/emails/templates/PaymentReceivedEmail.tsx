import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from '@react-email/components';

interface PaymentReceivedProps {
  toolName: string;
  tier: string;
  amount: string;
}

export const PaymentReceivedEmail = ({
  toolName = 'Your AI Tool',
  tier = 'Featured',
  amount = '₹14,999'
}: PaymentReceivedProps) => {
  return (
    <Html>
      <Head />
      <Preview>We've received your payment for the {tier} tier</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment Confirmed 🚀</Heading>

          <Text style={text}>
            Thank you! We've successfully received your payment of <strong>{amount}</strong> for the <strong>{tier}</strong> listing tier for <strong>{toolName}</strong>.
          </Text>

          <Text style={text}>
            Our AI Screening Pipeline evaluates submissions in under 3 minutes.
            If your submission scores above 80%, it will automatically publish live to the directory within the next 5 minutes.
          </Text>

          <Text style={text}>
            If there are any concerns, our editorial team will manually review it and follow up via email with exact steps to fix it.
          </Text>

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
const hr = { borderColor: '#e5e7eb', margin: '32px 0 24px 0' };
const footer = { color: '#9ca3af', fontSize: '14px', lineHeight: '22px' };

export default PaymentReceivedEmail;
