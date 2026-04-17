import { Html, Body, Head, Heading, Hr, Container, Preview, Section, Text, Button } from '@react-email/components';
import * as React from 'react';

interface FundingFeatureEmailProps {
  startupName: string;
  fundingAmount: string;
}

export const FundingFeatureEmail = ({ startupName, fundingAmount }: FundingFeatureEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your recent {fundingAmount} funding news is live on AI Startup Impact</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Congratulations on the raise!</Heading>
          <Text style={text}>
            Our editorial team just featured <strong>{startupName}</strong>'s recent <strong>{fundingAmount}</strong> funding round on the AI Startup Impact tracker!
          </Text>
          <Text style={text}>
            Thousands of VCs, engineers, and early adopters track our funding reports weekly to discover the fastest growing AI startups in India.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={`https://aistartupimpact.com/funding`}>
              View Funding Tracker
            </Button>
          </Section>
          <Text style={text}>
            Feel free to share the link with your investors and network on LinkedIn!
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Best regards,<br />The AI Startup Impact Editorial Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};
const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};
const heading = { ...main, fontSize: '30px', fontWeight: '700', padding: '0 48px', color: '#16a34a' };
const text = { ...main, fontSize: '16px', lineHeight: '1.5', padding: '0 48px' };
const buttonContainer = { padding: '24px 48px', textAlign: 'center' as const };
const button = { backgroundColor: '#5469d4', borderRadius: '4px', color: '#fff', fontSize: '16px', textDecoration: 'none', padding: '12px 24px', display: 'inline-block' };
const hr = { borderColor: '#e6ebf1', margin: '20px 0' };
const footer = { ...text, fontSize: '14px', color: '#8898aa', marginTop: '24px' };
