import { Html, Body, Head, Heading, Hr, Container, Preview, Section, Text, Button, Link } from '@react-email/components';
import * as React from 'react';

interface ApprovalEmailProps {
  toolName: string;
  toolSlug: string;
}

export const ApprovalEmail = ({ toolName, toolSlug }: ApprovalEmailProps) => {
  const badgeCode = `<a href="https://aistartupimpact.com/tools/${toolSlug}" target="_blank"><img src="https://aistartupimpact.com/badges/featured.svg" alt="Featured on AI Startup Impact" width="250" height="54" /></a>`;

  return (
    <Html>
      <Head />
      <Preview>Your AI tool {toolName} has been approved!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Congratulations!</Heading>
          <Text style={text}>
            We've reviewed your submission, and we're thrilled to inform you that <strong>{toolName}</strong> has been officially approved and featured on the AI Startup Impact directory.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={`https://aistartupimpact.com/tools/${toolSlug}`}>
              View Your Live Page
            </Button>
          </Section>
          <Hr style={hr} />
          <Heading as="h3" style={subheading}>Embed Your "Featured" Badge</Heading>
          <Text style={text}>
            Boost your SEO and build trust by embedding our official Featured badge on your website footer or home page. Copy the HTML code below:
          </Text>
          <div style={codeBlock}>
            <code>{badgeCode}</code>
          </div>
          <Text style={text}>
            When users click the badge, they will be sent directly to your tool's review page. This helps both of us build strong domain authority!
          </Text>
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
const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
  padding: '0 48px',
};
const subheading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#484848',
  padding: '0 48px',
};
const text = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#525f7f',
  padding: '0 48px',
};
const buttonContainer = {
  padding: '24px 48px',
  textAlign: 'center' as const,
};
const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};
const codeBlock = {
  margin: '0 48px',
  padding: '16px',
  backgroundColor: '#f4f4f4',
  borderRadius: '5px',
  fontFamily: 'monospace',
  fontSize: '14px',
  color: '#e83e8c',
  wordBreak: 'break-all' as const,
};
const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};
const footer = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#8898aa',
  padding: '0 48px',
  marginTop: '24px',
};
