import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Preview,
  Section,
  Text,
  Img,
} from '@react-email/components';

interface OtpEmailProps {
  otp: string;
  name?: string;
}

export const OtpEmail = ({ otp, name }: OtpEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your AIStartupImpact verification code: {otp}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://aistartupimpact.com/logo.png"
            width="150"
            alt="AIStartupImpact Logo"
            style={logo}
          />
          <Heading style={h1}>Verify your email address</Heading>
          <Text style={text}>
            Hello {name || 'there'},
          </Text>
          <Text style={text}>
            Please use the following verification code to complete your sign-in process. This code is valid for 10 minutes.
          </Text>
          <Section style={codeBox}>
            <Text style={codeText}>{otp}</Text>
          </Section>
          <Text style={textSmall}>
            If you didn't request this email, there's nothing to worry about — you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OtpEmail;

// ─── Styles ──────────────────────────────────────────────

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  maxWidth: '560px',
};

const logo = {
  margin: '0 auto',
  marginBottom: '24px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  padding: '0 48px',
  textAlign: 'center' as const,
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 48px',
  textAlign: 'left' as const,
};

const codeBox = {
  background: '#f4f4f5',
  borderRadius: '4px',
  margin: '16px 48px',
  padding: '24px',
};

const codeText = {
  color: '#000',
  fontSize: '32px',
  fontWeight: '700',
  letterSpacing: '6px',
  margin: '0',
  textAlign: 'center' as const,
};

const textSmall = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 48px',
  marginTop: '24px',
  textAlign: 'center' as const,
};
