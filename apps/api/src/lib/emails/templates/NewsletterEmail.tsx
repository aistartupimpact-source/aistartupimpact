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
  Link,
  Hr,
} from '@react-email/components';

interface NewsletterEmailProps {
  subject: string;
  previewText?: string;
  articles: Array<{
    title: string;
    excerpt: string;
    url: string;
    imageUrl?: string;
  }>;
}

export const NewsletterEmail = ({ subject, previewText, articles }: NewsletterEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText || subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://aistartupimpact.com/logo.png"
              width="180"
              alt="AIStartupImpact Logo"
              style={logo}
            />
          </Section>

          <Heading style={h1}>{subject}</Heading>

          {articles.map((article, index) => (
            <Section key={index} style={articleSection}>
              {article.imageUrl && (
                <Img src={article.imageUrl} width="100%" style={articleImage} alt={article.title} />
              )}
              <Text style={articleTitle}>{article.title}</Text>
              <Text style={articleExcerpt}>{article.excerpt}</Text>
              <Link href={article.url} style={readMoreLink}>
                Read Full Story →
              </Link>
              {index < articles.length - 1 && <Hr style={hr} />}
            </Section>
          ))}

          <Hr style={footerHr} />

          <Text style={footerText}>
            You are receiving this because you subscribed to AIStartupImpact.
            <br />
            <Link href="https://aistartupimpact.com/unsubscribe" style={unsubscribeLink}>
              Unsubscribe from these emails
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default NewsletterEmail;

// ─── Styles ──────────────────────────────────────────────

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  maxWidth: '600px',
  overflow: 'hidden',
};

const header = {
  backgroundColor: '#0a0a0a', // Dark theme header
  padding: '32px 0',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.25',
  padding: '32px 48px 16px',
  margin: '0',
  textAlign: 'center' as const,
};

const articleSection = {
  padding: '16px 48px',
};

const articleImage = {
  borderRadius: '8px',
  marginBottom: '16px',
  objectFit: 'cover' as const,
};

const articleTitle = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const articleExcerpt = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const readMoreLink = {
  color: '#ef4444', // Brand red color
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0 0 0',
};

const footerHr = {
  borderColor: '#e2e8f0',
  margin: '32px 48px 24px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 48px',
  textAlign: 'center' as const,
};

const unsubscribeLink = {
  color: '#8898aa',
  textDecoration: 'underline',
};
