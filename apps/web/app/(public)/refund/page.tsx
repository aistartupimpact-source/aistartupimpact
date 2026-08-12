export default function RefundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <h1 className="font-sora font-extrabold text-3xl sm:text-5xl text-navy dark:text-white mb-8">
        Refund & Cancellation Policy
      </h1>
      <div className="prose prose-lg dark:prose-invert prose-blue max-w-none">
        <p className="text-sm text-gray-500 mb-8"><strong>Last updated:</strong> August 10, 2026</p>

        <p>
          AI Startup Impact provides various digital services, including premium tool listings, sponsored directory placements, job board postings, event tickets, and advertising slots. This Refund & Cancellation Policy outlines the financial terms governing purchases made on our platform.
        </p>

        <h2>1. Payment Processing</h2>
        <p>
          All payments on AI Startup Impact are processed securely through <strong>Razorpay</strong>, a PCI-DSS compliant payment gateway regulated by the Reserve Bank of India (RBI). We do not store your credit/debit card details on our servers. All payment data is handled directly by Razorpay in accordance with their security standards.
        </p>
        <ul>
          <li>All prices are displayed in Indian Rupees (INR).</li>
          <li>Applicable taxes (GST) are included or shown separately at checkout.</li>
          <li>You will receive a payment confirmation email upon successful transaction.</li>
        </ul>

        <h2>2. Premium Tool Listings</h2>
        <p>
          Purchases for premium tool listing upgrades are considered final once the upgrade is activated. Since the upgraded listing is immediately live and visible, refunds are not available for active listings.
        </p>

        <h2>3. Sponsored Listings & Advertising</h2>
        <p>
          Purchases for native advertising, featured placement spots, and sponsored newsletter campaigns are subject to the following:
        </p>
        <ul>
          <li>If an advertising campaign has already commenced or the newsletter has been sent, the fees are non-refundable.</li>
          <li>If you request a cancellation <strong>at least 5 business days</strong> prior to the scheduled campaign launch, we will process a full refund minus payment gateway processing fees (2-3%).</li>
          <li>Cancellations requested less than 5 business days before the scheduled date will not be refunded, though we may allow rescheduling at our discretion.</li>
        </ul>

        <h2>4. Job Board Postings</h2>
        <p>
          All purchases for job listings on the AI Startup Impact Job Board are considered final once the job is published on our platform. No refunds will be provided for positions filled before listing expiration or if the listing does not generate a desired number of applicants.
        </p>

        <h2>5. Event Tickets</h2>
        <p>
          Event ticket purchases are subject to the individual event&apos;s cancellation policy as set by the event organizer. If an event is cancelled by the organizer, registered attendees will receive a full refund.
        </p>

        <h2>6. Failed Transactions</h2>
        <p>
          In compliance with RBI guidelines, if a payment is debited from your account but the transaction fails or is not confirmed by our system:
        </p>
        <ul>
          <li>The amount will be automatically refunded to your original payment method within <strong>5 business days</strong>.</li>
          <li>If you do not receive the refund within 5 business days, please contact us with your Razorpay payment ID or order ID.</li>
          <li>Duplicate charges due to payment gateway errors will be refunded automatically or upon request within 48 hours.</li>
        </ul>

        <h2>7. Exceptional Circumstances</h2>
        <p>
          We may grant exceptions and issue refunds on a case-by-case basis:
        </p>
        <ul>
          <li><strong>Duplicate Charges:</strong> Accidental multiple charges due to a payment gateway error.</li>
          <li><strong>Service Unavailability:</strong> Extended platform downtime that significantly impairs the value of a time-bound purchase.</li>
          <li><strong>Unauthorized Transactions:</strong> If you believe a transaction was made without your authorization, report it within 48 hours.</li>
        </ul>

        <h2>8. Refund Process</h2>
        <p>
          Approved refunds will be processed within <strong>5 to 7 business days</strong> and credited back to the original payment method. Depending on your bank or card issuer, it may take additional days for the amount to reflect in your account. Refunds are processed through Razorpay&apos;s refund system for full traceability.
        </p>

        <h2>9. Contact for Billing</h2>
        <p>
          To initiate a cancellation, dispute a charge, or request a refund, please contact our billing team with your Razorpay payment ID or order ID:
        </p>
        <p>
          <strong>Email:</strong> billing@aistartupimpact.com<br />
          <strong>Response time:</strong> Within 48 hours on business days.
        </p>
      </div>
    </div>
  );
}
