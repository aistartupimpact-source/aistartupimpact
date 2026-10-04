import type { Metadata } from 'next';

const SITE = 'https://udyaibase.com';

export const metadata: Metadata = {
  title: 'Careers at Udyaibase — Join India\'s AI Startup Platform | Internships & Full-Time Roles',
  description:
    'Join Udyaibase, the platform tracking India\'s AI startup ecosystem. We\'re hiring remote interns and full-time roles in Engineering, Content, Design, and Marketing. Apply now.',
  keywords: [
    'Udyaibase careers', 'AI startup jobs India', 'remote internship India',
    'Next.js developer intern', 'content writer intern', 'UI UX designer intern',
    'startup internship remote', 'AI startup platform jobs', 'Udyaibase jobs',
    'tech internship India 2026', 'full stack developer remote India',
  ],
  alternates: { canonical: '/careers' },
  openGraph: {
    title: 'Careers at Udyaibase — Build India\'s AI Startup Ecosystem',
    description:
      'Remote-first internships and full-time roles across Engineering, Content, Design, and Marketing. Ship real features on a live platform used by thousands.',
    url: `${SITE}/careers`,
    siteName: 'Udyaibase',
    type: 'website',
    images: [
      {
        url: `${SITE}/og/careers.png`,
        width: 1200,
        height: 630,
        alt: 'Careers at Udyaibase — Internships & Full-Time Roles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers at Udyaibase — Join India\'s AI Startup Platform',
    description:
      'We\'re hiring! Remote internships and full-time roles in Engineering, Content, Design & Marketing. Apply now.',
    site: '@udyaibase',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const ROLES_FOR_SCHEMA = [
  { title: 'Frontend Developer Intern', type: 'INTERNSHIP', department: 'Engineering', location: 'Remote' },
  { title: 'Full Stack Developer Intern', type: 'INTERNSHIP', department: 'Engineering', location: 'Remote' },
  { title: 'Backend Developer Intern', type: 'INTERNSHIP', department: 'Engineering', location: 'Remote' },
  { title: 'Next.js Developer Intern', type: 'INTERNSHIP', department: 'Engineering', location: 'Remote' },
  { title: 'React Native Developer Intern', type: 'INTERNSHIP', department: 'Engineering', location: 'Remote' },
  { title: 'Generative AI Engineer Intern', type: 'INTERNSHIP', department: 'AI/ML', location: 'Remote' },
  { title: 'ML/Data Science Intern', type: 'INTERNSHIP', department: 'AI/ML', location: 'Remote' },
  { title: 'Content Writer Intern', type: 'INTERNSHIP', department: 'Content', location: 'Remote' },
  { title: 'SEO & Growth Intern', type: 'INTERNSHIP', department: 'Marketing', location: 'Remote' },
  { title: 'Graphic Designer Intern', type: 'INTERNSHIP', department: 'Design', location: 'Remote' },
  { title: 'UI/UX Designer Intern', type: 'INTERNSHIP', department: 'Design', location: 'Remote' },
  { title: 'Social Media Intern', type: 'INTERNSHIP', department: 'Marketing', location: 'Remote' },
  { title: 'DevOps Intern', type: 'INTERNSHIP', department: 'Engineering', location: 'Remote' },
  { title: 'Senior Full Stack Developer', type: 'FULL_TIME', department: 'Engineering', location: 'Remote / Hybrid' },
  { title: 'AI/ML Engineer', type: 'FULL_TIME', department: 'AI/ML', location: 'Remote / Hybrid' },
  { title: 'Senior Content Editor', type: 'FULL_TIME', department: 'Content', location: 'Remote' },
  { title: 'Product Designer', type: 'FULL_TIME', department: 'Design', location: 'Remote / Hybrid' },
  { title: 'Growth & Marketing Lead', type: 'FULL_TIME', department: 'Marketing', location: 'Remote' },
];

function buildJobPostingSchema() {
  return ROLES_FOR_SCHEMA.map(role => ({
    '@type': 'JobPosting',
    title: role.title,
    description: `${role.title} at Udyaibase — India's AI startup ecosystem platform. Department: ${role.department}.`,
    datePosted: '2026-09-01',
    employmentType: role.type === 'INTERNSHIP' ? 'INTERN' : 'FULL_TIME',
    jobLocationType: 'TELECOMMUTE',
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'India',
    },
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Udyaibase Technologies Private Limited',
      sameAs: SITE,
      logo: `${SITE}/logo.png`,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Vijayawada',
        addressRegion: 'Andhra Pradesh',
        addressCountry: 'IN',
      },
    },
  }));
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Careers at Udyaibase',
        description: 'Join Udyaibase — remote internships and full-time roles building India\'s AI startup platform.',
        url: `${SITE}/careers`,
        isPartOf: { '@type': 'WebSite', name: 'Udyaibase', url: SITE },
      },
      ...buildJobPostingSchema(),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
