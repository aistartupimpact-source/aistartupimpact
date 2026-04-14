export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <h1 className="font-sora font-extrabold text-3xl sm:text-5xl text-navy dark:text-white mb-8">
        Legal Disclaimer
      </h1>
      <div className="prose prose-lg dark:prose-invert prose-blue max-w-none">
        <p className="text-sm text-gray-500 mb-8"><strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p>
          The information contained on AI Startup Impact (the "Website") is strictly for general informational, educational, and journalistic purposes regarding the Indian artificial intelligence and startup ecosystem.
        </p>

        <h2>1. No Professional Advice</h2>
        <p>
          AI Startup Impact aims to offer news, data, startup analyses, and funding reports. However, none of the information provided on our Website should be construed as professional, financial, investment, legal, or technical advice.
        </p>
        <p>
          We do not encourage nor endorse investing in any specific startups or AI technologies featured on our platform. Funding announcements and startup evaluations are based on publicly available data, press releases, or founder claims, and remain speculative by nature. Always consult with a certified financial advisor or legal professional before making any investment decisions.
        </p>

        <h2>2. Data Accuracy & Completeness</h2>
        <p>
          While we make every effort to ensure that the content provided is accurate and up-to-date, the AI landscape moves rapidly. AI Startup Impact makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website. Any reliance you place on such information is strictly at your own risk.
        </p>

        <h2>3. External Links & Tools</h2>
        <p>
          Our Website may contain links to external websites, software, AI models, and tools. AI Startup Impact has no control over the nature, content, and availability of those sites/tools. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them. We cannot be held liable for any damages or losses stemming from the use of third-party AI tools featured or reviewed.
        </p>

        <h2>4. "Featured" and Sponsored Content</h2>
        <p>
          Some articles, startup features, or directory listings may be sponsored or paid placements by the company being featured. When an article or listing is sponsored, we will make reasonable efforts to disclose it. However, the presence of a startup on AI Startup Impact does not constitute an endorsement by our editorial team.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          In no event will AI Startup Impact, its team members, editors, or parent company be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.
        </p>

        <p className="mt-8">
          By utilizing AI Startup Impact, you acknowledge that you have read, understood, and agreed to be legally bound by this Disclaimer alongside our Terms & Conditions.
        </p>
      </div>
    </div>
  );
}
