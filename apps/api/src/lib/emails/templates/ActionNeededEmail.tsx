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

interface ActionNeededEmailProps {
  toolName: string;
  suggestedEdits: string[];
  magicEditLink: string;
}

export const ActionNeededEmail = ({
  toolName = 'Your AI Tool',
  suggestedEdits = [
    'Make the description more detailed (at least 200 words).',
    'Remove marketing buzzwords and focus on the immediate utility.',
  ],
  magicEditLink = 'https://aistartupimpact.com/submit-tool/resume',
}: ActionNeededEmailProps) => {
  const previewText = `Action needed to publish ${toolName} on AI Startup Impact`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Almost there! Let's get {toolName} live.</Heading>

          <Text style={text}>
            Thanks for submitting <strong>{toolName}</strong>! Our AI screening pipeline has analyzed your submission.
            To maintain high-quality listings, your submission was placed in the manual review queue because it did not meet our automatic publishing thresholds.
          </Text>

          <Text style={text}>
            Don't worry — this is an easy fix. Here are the exact verbatim edits suggested by our system:
          </Text>

          <Section style={editsBox}>
            {suggestedEdits.map((edit, idx) => (
              <Text key={idx} style={editItem}>
                • {edit}
              </Text>
            ))}
          </Section>

          <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
            <Link href={magicEditLink} style={button}>
              Fix my Submission
            </Link>
          </Section>

          <Text style={text}>
            Once you make these changes, our pipeline will instantly re-evaluate your tool and publish it live!
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            AI Startup Impact Directory Team<br />
            Building the best ecosystem for founders.
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

const h1 = {
  color: '#0d162a', // Navy brand color
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '32px',
  margin: '0 0 20px 0',
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px 0',
};

const editsBox = {
  backgroundColor: '#fffbeb', // Light yellow for attention
  border: '1px solid #fde68a',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
};

const editItem = {
  color: '#92400e', // Dark amber text
  fontSize: '15px',
  margin: '8px 0',
  lineHeight: '22px',
};

const button = {
  backgroundColor: '#ab0f2b', // Brand color
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  fontWeight: 'bold',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0 24px 0',
};

const footer = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '22px',
};

export default ActionNeededEmail;
