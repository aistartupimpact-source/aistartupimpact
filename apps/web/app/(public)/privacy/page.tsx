export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <h1 className="font-sora font-extrabold text-3xl sm:text-5xl text-navy dark:text-white mb-8">
        Privacy Policy
      </h1>
      <div className="prose prose-lg dark:prose-invert prose-blue max-w-none">
        <p className="text-sm text-gray-500 mb-8"><strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p>
          Welcome to AI Startup Impact. This Privacy Policy outlines how <strong>AI Startup Impact</strong> ("we", "our", or "us") collects, uses, protects, and discloses your personal information when you use our website, newsletters, funding trackers, and related services (collectively, the "Services"). We are committed to safeguarding your privacy under the Indian Information Technology Act, 2000, and standard global data protection principles.
        </p>

        <h2>1. Information We Collect</h2>
        <p>We may collect personal and non-personal data depending on how you interact with our Services:</p>
        <ul>
          <li><strong>Personal Information:</strong> Name, email address, phone number, company affiliation, and LinkedIn/Twitter handles, particularly when you subscribe to our newsletter, submit a startup profile, or contact us.</li>
          <li><strong>Usage Data:</strong> Pages visited, time spent on the site, clicks, referrer URLs, IP address, device type, and browser information (collected via Google Analytics or similar tools).</li>
          <li><strong>Cookies & Tracking Technologies:</strong> Small data files stored on your device that help us remember preferences and improve site functionality.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>The information we collect is utilized to:</p>
        <ul>
          <li>Deliver high-quality AI news, exclusive funding updates, and newsletter content.</li>
          <li>Process submissions for our "Featured AI Startup" directory and job board.</li>
          <li>Analyze website traffic to improve user experience using cookies and tracking pixels.</li>
          <li>Address customer support requests and provide technical assistance.</li>
          <li>Compliance with legal obligations and prevention of fraudulent activities.</li>
        </ul>

        <h2>3. Data Sharing & Third-Party Services</h2>
        <p>We do not sell your personal data. We may share information with trusted third parties exclusively for operational purposes:</p>
        <ul>
          <li><strong>Service Providers:</strong> Email delivery platforms (e.g., Mailchimp, Resend), hosting providers (Vercel), and analytics partners (Google Analytics).</li>
          <li><strong>Legal Requirements:</strong> If mandated by Indian law enforcement or regulatory bodies, we will disclose information necessary for compliance.</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>We implement commercially reasonable security measures including SSL encryption, secure data hosting, and restricted access to database environments to protect your personal information against unauthorized access, theft, or misuse.</p>

        <h2>5. Your Privacy Rights</h2>
        <p>Users always have the following rights regarding their data:</p>
        <ul>
          <li><strong>Access & Correction:</strong> Request a copy of the data we hold and correct incomplete or inaccurate information.</li>
          <li><strong>Opt-Out & Erasure:</strong> Unsubscribe from marketing communications at any time or request the complete deletion of your personal records from our system.</li>
        </ul>

        <h2>6. Changes to This Policy</h2>
        <p>We may periodically review and update this Privacy Policy. Any modifications will be posted on this page along with the updated "Last updated" date. Continued use of our Services implies consent to the revised policy.</p>

        <h2>7. Contact Us</h2>
        <p>If you have questions, concerns, or requests relating to this Privacy Policy, please contact our Data Protection Officer at:</p>
        <p><strong>Email:</strong> privacy@aistartupimpact.com<br /><strong>Address:</strong> Bengaluru, Karnataka, India</p>
      </div>
    </div>
  );
}
