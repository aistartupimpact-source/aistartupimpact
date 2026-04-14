export default function RefundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <h1 className="font-sora font-extrabold text-3xl sm:text-5xl text-navy dark:text-white mb-8">
        Refund & Cancellation Policy
      </h1>
      <div className="prose prose-lg dark:prose-invert prose-blue max-w-none">
        <p className="text-sm text-gray-500 mb-8"><strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p>
          AI Startup Impact provides various digital services, including premium newsletter subscriptions, sponsored directory listings, job board postings, and advertising slots. This Refund & Cancellation Policy outlines the financial terms governing purchases made on our platform.
        </p>

        <h2>1. Premium Newsletters & Subscriptions</h2>
        <p>
          If you are subscribing to any premium content tier, payments are generally processed on a recurring basis (monthly or annually).
        </p>
        <ul>
          <li><strong>Cancellations:</strong> You may cancel your subscription at any time through your account dashboard. The cancellation will take effect at the end of the current billing cycle, and you will retain access until that date.</li>
          <li><strong>Refunds:</strong> Since our subscription products involve immediate access to proprietary digital content and databases, we do not offer prorated refunds for mid-cycle cancellations. However, if you experienced technical issues that prevented you from accessing the service entirely, please contact us within 7 days of purchase.</li>
        </ul>

        <h2>2. Sponsored Listings & Advertising</h2>
        <p>
          Purchases for native advertising, featured "AI Tool of the Week" spots, and sponsored newsletter bursts are subject to the following rules:
        </p>
        <ul>
          <li>If an advertising campaign has already commenced or the newsletter has been sent, the fees are absolutely non-refundable.</li>
          <li>If you request a cancellation <strong>at least 5 business days</strong> prior to the scheduled campaign launch, we will process a full refund minus processing fees (5-7%).</li>
          <li>Cancellations requested less than 5 business days before the scheduled running date will not be refunded, though we may, at our discretion, allow for rescheduling.</li>
        </ul>

        <h2>3. Job Board Postings</h2>
        <p>
          All direct purchases for listings on the AI Startup Impact Job Board are considered final once the job is live on our platform. No refunds will be provided for positions filled prior to the expiration of the listing period, or if the listing does not generate a desired number of applicants.
        </p>

        <h2>4. Exceptional Circumstances</h2>
        <p>
          We may grant exceptions and issue refunds on a case-by-case basis under the following scenarios:
        </p>
        <ul>
          <li><strong>Duplicate Charges:</strong> If you were accidentally charged multiple times due to a payment gateway error.</li>
          <li><strong>Service Unavailability:</strong> If our platform experiences extended downtime that significantly impairs the value of a time-bound advertisement.</li>
        </ul>

        <h2>5. Refund Process</h2>
        <p>
          Approved refunds will be processed within 7 to 10 business days and credited back to the original method of payment used during purchase. Depending on your bank or credit card issuer, it might take a few additional days for the funds to reflect in your account.
        </p>

        <h2>6. Contact For Billing</h2>
        <p>
          To initiate a cancellation, dispute a charge, or request a refund, please contact our billing team with your receipt or transaction ID.
        </p>
        <p><strong>Email:</strong> billing@aistartupimpact.com</p>
      </div>
    </div>
  );
}
