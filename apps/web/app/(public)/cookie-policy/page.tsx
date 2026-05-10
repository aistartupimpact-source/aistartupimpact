import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | AI Startup Impact',
  description: 'Learn about how we use cookies and similar technologies on AI Startup Impact.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
          
          <p className="text-sm text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are placed on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                understanding how you use our site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies for the following purposes:
              </p>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Necessary Cookies</h3>
                <p className="text-gray-700 mb-2">
                  These cookies are essential for the website to function properly. They enable core 
                  functionality such as security, network management, and accessibility.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Authentication and session management</li>
                  <li>Security and fraud prevention</li>
                  <li>Cookie consent preferences</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics Cookies</h3>
                <p className="text-gray-700 mb-2">
                  These cookies help us understand how visitors interact with our website by collecting 
                  and reporting information anonymously.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Google Analytics (_ga, _gid, _gat)</li>
                  <li>Page view tracking</li>
                  <li>User behavior analysis</li>
                  <li>Performance monitoring</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Marketing Cookies</h3>
                <p className="text-gray-700 mb-2">
                  These cookies are used to track visitors across websites to display relevant and 
                  engaging advertisements.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Advertising campaign tracking</li>
                  <li>Retargeting and remarketing</li>
                  <li>Social media integration</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                We use services from third-party providers that may set cookies on your device:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  <strong>Google Analytics:</strong> Helps us analyze website traffic and user behavior
                </li>
                <li>
                  <strong>Social Media Platforms:</strong> Enable social sharing and integration features
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
              <p className="text-gray-700 mb-4">
                You have the right to decide whether to accept or reject cookies. You can exercise your 
                cookie preferences by:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Using the cookie consent banner that appears when you first visit our site</li>
                <li>Clicking the "Cookie Settings" link in our website footer</li>
                <li>Adjusting your browser settings to block or delete cookies</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Please note that blocking certain cookies may impact your experience on our website and 
                limit the functionality available to you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookie Retention</h2>
              <p className="text-gray-700 mb-4">
                Different cookies have different retention periods:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  <strong>Session Cookies:</strong> Deleted when you close your browser
                </li>
                <li>
                  <strong>Persistent Cookies:</strong> Remain on your device for a set period (typically 1-24 months)
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons. When we make significant changes, 
                we will notify you and may ask you to re-consent to our use of cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about our use of cookies, please contact us at:
              </p>
              <p className="text-gray-700">
                Email: <a href="mailto:privacy@aistartupimpact.com" className="text-purple-600 hover:text-purple-700">privacy@aistartupimpact.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">
                Under GDPR, CCPA, and DPDP regulations, you have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Withdraw consent at any time</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
