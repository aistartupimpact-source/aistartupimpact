import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification Policy — AI Startup Impact",
  description: "Learn how startup and organizer verification works on AI Startup Impact, including DNS domain verification and what the verified badge means.",
};

export default function VerificationPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white mb-6">
        Verification Policy
      </h1>
      <div className="prose prose-sm sm:prose-base dark:prose-invert prose-blue max-w-none">
        <p className="text-sm text-gray-500 mb-8"><strong>Last updated:</strong> July 2026</p>

        <p>
          AI Startup Impact provides a verification system to help users identify authentic company profiles. This policy explains how verification works, what it means, and how to get verified.
        </p>

        <h2>1. What Does the Verified Badge Mean?</h2>
        <p>
          The <strong>✓ Verified</strong> badge on a startup or organizer profile indicates that the profile owner has successfully completed domain verification. This confirms that the person managing the profile has administrative access to the company's official domain (website).
        </p>
        <p>The verified badge does <strong>not</strong> imply:</p>
        <ul>
          <li>Endorsement by AI Startup Impact</li>
          <li>Accuracy of all information on the profile</li>
          <li>Financial stability or investment worthiness</li>
          <li>Quality of products or services offered</li>
        </ul>
        <p>It solely confirms <strong>ownership and domain control</strong>.</p>

        <h2>2. How DNS Domain Verification Works</h2>
        <p>The verification process involves adding a unique DNS TXT record to your company's domain. Here's how it works:</p>
        <ol>
          <li><strong>Claim your profile</strong> — Sign in to your Founder Dashboard and navigate to your startup profile.</li>
          <li><strong>Initiate verification</strong> — Click "Verify Ownership" to receive a unique verification token.</li>
          <li><strong>Add DNS record</strong> — Add a TXT record to your domain's DNS settings with the provided token value. The record format is: <code>aistartupimpact-verify=YOUR_TOKEN</code></li>
          <li><strong>Confirm verification</strong> — Click "Check Verification" in your dashboard. Our system queries your domain's DNS records to confirm the token.</li>
          <li><strong>Badge applied</strong> — Once confirmed, the verified badge appears on your profile immediately.</li>
        </ol>

        <h2>3. Who Can Get Verified?</h2>
        <ul>
          <li>Founders or authorized representatives of listed startups</li>
          <li>Event organizers with a registered domain</li>
          <li>AI tool developers with a registered product domain</li>
        </ul>

        <h2>4. Verification Requirements</h2>
        <ul>
          <li>A registered domain name that matches or is associated with your company</li>
          <li>Administrative access to your domain's DNS settings</li>
          <li>An active AI Startup Impact founder or organizer account</li>
          <li>Your profile must comply with our <a href="/content-guidelines">Content Guidelines</a></li>
        </ul>

        <h2>5. Verification Revocation</h2>
        <p>We may revoke verification if:</p>
        <ul>
          <li>The DNS record is removed from the domain</li>
          <li>The domain expires or changes ownership</li>
          <li>The profile violates our Terms of Service or Content Guidelines</li>
          <li>We receive a valid trademark or legal dispute regarding the profile</li>
        </ul>

        <h2>6. Disputes</h2>
        <p>
          If you believe a profile has been incorrectly verified or someone has claimed your company's profile without authorization, please contact us at <a href="mailto:legal@aistartupimpact.com">legal@aistartupimpact.com</a> with supporting documentation. We will investigate within 5 business days.
        </p>

        <h2>7. Contact</h2>
        <p>For questions about verification, email <a href="mailto:support@aistartupimpact.com">support@aistartupimpact.com</a> or visit our <a href="/contact">Contact page</a>.</p>
      </div>
    </div>
  );
}
