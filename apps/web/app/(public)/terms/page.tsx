export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <h1 className="font-sora font-extrabold text-3xl sm:text-5xl text-navy dark:text-white mb-8">
        Terms & Conditions
      </h1>
      <div className="prose prose-lg dark:prose-invert prose-blue max-w-none">
        <p className="text-sm text-gray-500 mb-8"><strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p>
          Welcome to AI Startup Impact. By accessing or using our website, newsletters, funding resources, and directories (collectively, "Services"), you agree to abide by and be bound by the following Terms & Conditions. If you do not agree with any of these terms, please do not use our Services.
        </p>

        <h2>1. Scope of Services</h2>
        <p>
          AI Startup Impact is an informational platform dedicated to the Indian Artificial Intelligence ecosystem. We provide news, startup directory listings, funding reports, tool reviews, and editorial content. All content provided is for informational purposes only.
        </p>

        <h2>2. Intellectual Property Rights</h2>
        <p>
          All graphics, texts, logos, structural design, and multimedia content featured on AI Startup Impact are the exclusive property of AI Startup Impact or its respective licensors. Users are granted a limited, non-exclusive license to use the content for personal, non-commercial purposes.
        </p>
        <p>
          Scraping, copying, or republishing our comprehensive startup directories, funding data, or news articles without explicit written authorization is strictly prohibited and subject to legal action.
        </p>

        <h2>3. User-Submitted Content</h2>
        <p>
          When you submit information (e.g., startup profiles, comments, press releases) to AI Startup Impact, you grant us a worldwide, royalty-free license to use, reproduce, modify, and publish this content. You guarantee that any submitted material is accurate, lawful, and does not infringe upon third-party rights. We reserve the right to reject or remove content at our discretion.
        </p>

        <h2>4. User Conduct</h2>
        <p>While using our website, you agree that you will not:</p>
        <ul>
          <li>Misrepresent your identity or affiliation with any organization or startup.</li>
          <li>Attempt to breach or probe the security vulnerabilities of our hosting environment.</li>
          <li>Transmit any malicious software, viruses, or harmful code.</li>
          <li>Engage in automated scraping or systematic extraction of data from our APIs or pages.</li>
        </ul>

        <h2>5. External Links</h2>
        <p>
          Our platform frequently contains links to external websites, startups, and resources. These links do not imply an endorsement of the linked services. We hold no responsibility for the accuracy, legality, or content of these external sites.
        </p>

        <h2>6. Newsletter and Communications</h2>
        <p>
          By creating an account or subscribing, you consent to receive periodic emails including news, service updates, and occasional partner promotions. You can opt-out at any time via the unsubscribe links in the email footer.
        </p>

        <h2>7. Disclaimer of Warranties</h2>
        <p>
          The Services are provided strictly on an "AS IS" and "AS AVAILABLE" basis. While we strive to maintain accurate funding data and news regarding the Indian AI landscape, we offer no absolute guarantees or warranties, express or implied, regarding the timeliness, completeness, or reliability of any data.
        </p>

        <h2>8. Limitations of Liability</h2>
        <p>
          Under no circumstances shall AI Startup Impact, its writers, or its founders be liable for any indirect, incidental, consequential, special, or exemplary damages—including but not limited to loss of business, reduced profits, or lost data—resulting from your reliance upon the information provided on our site.
        </p>

        <h2>9. Governing Law & Jurisdiction</h2>
        <p>
          These Terms & Conditions shall be strictly governed by the laws of India. Any disputes arising from the use of our services shall fall under the exclusive jurisdiction of the state courts situated in Bengaluru, Karnataka.
        </p>

        <h2>10. Modifications</h2>
        <p>
          We reserve the right to alter these Terms at any time. Significant changes will be communicated via email or a prominent notification on our website.
        </p>

        <p className="mt-8">
          <strong>Contact Us:</strong> legal@aistartupimpact.com
        </p>
      </div>
    </div>
  );
}
