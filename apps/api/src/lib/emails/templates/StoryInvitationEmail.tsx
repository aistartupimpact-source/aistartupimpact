import { Html, Body, Head, Heading, Hr, Container, Preview, Section, Text, Button } from '@react-email/components';
import * as React from 'react';

interface StoryInvitationEmailProps {
  toolName: string;
}

export const StoryInvitationEmail = ({ toolName }: StoryInvitationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>We want to feature your story behind {toolName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Let's tell your story</Heading>
          <Text style={text}>
            It's been a week since <strong>{toolName}</strong> was approved on AI Startup Impact, and your tool has been getting some great attention!
          </Text>
          <Text style={text}>
            Our editorial team would love to feature the unique founder's story behind building {toolName}. Founder stories give our thousands of developer and VC readers an inside look at your journey, technical challenges, and growth lessons.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={`https://aistartupimpact.com/stories/submit?tool=${encodeURIComponent(toolName)}`}>
              Answer 5 Quick Questions
            </Button>
          </Section>
          <Text style={text}>
            It takes about 5 minutes to submit your story. Once published, it will be permanently attached to your tool's directory profile and shared in our weekly newsletter.
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
const heading = { ...main, fontSize: '30px', fontWeight: '700', padding: '0 48px' };
const text = { ...main, fontSize: '16px', lineHeight: '1.5', padding: '0 48px' };
const buttonContainer = { padding: '24px 48px', textAlign: 'center' as const };
const button = { backgroundColor: '#10b981', borderRadius: '4px', color: '#fff', fontSize: '16px', textDecoration: 'none', padding: '12px 24px', display: 'inline-block' };
const hr = { borderColor: '#e6ebf1', margin: '20px 0' };
const footer = { ...text, fontSize: '14px', color: '#8898aa', marginTop: '24px' };
